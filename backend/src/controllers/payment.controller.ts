import { Request, Response } from 'express';
import Stripe from 'stripe';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

if (!STRIPE_SECRET_KEY) {
  console.error('FATAL ERROR: STRIPE_SECRET_KEY is not defined. Stripe payments will not be available. Please set this environment variable.');
  // In a real application, you might want to exit the process or disable payment routes.
}

const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY) : null;

if (stripe) {
  console.log(`[Stripe Config] Secret Key loaded: ${STRIPE_SECRET_KEY?.substring(0, 7)}... (Mode: ${STRIPE_SECRET_KEY?.startsWith('sk_live') ? 'LIVE' : 'TEST'})`);
}

// Mercado Pago integration removed; Stripe handles payments now.

export const createStripePaymentIntent = async (req: Request, res: Response) => {
  if (!stripe) {
    return res.status(500).json({ error: 'Stripe is not configured. STRIPE_SECRET_KEY is missing from environment variables.' });
  }

  const { amount, currency, orderId, metadata, briefing, userId, mainPlan, maintenancePlan, clientName, clientEmail, payment_method_types } = req.body;
  console.log(`[Stripe] Creating PaymentIntent: ${amount} ${currency} for order ${orderId}`, { payment_method_types });

  if (!amount || amount <= 0 || !currency) {
    return res.status(400).json({ error: 'Invalid amount or currency for payment.' });
  }

  try {
    const paymentIntentParams: any = {
      amount: Math.round(Number(amount) * 100),
      currency: currency.toLowerCase() === 'r$' ? 'brl' : (currency.toLowerCase() === '€' ? 'eur' : currency.toLowerCase()),
      metadata: metadata || {
        order_id: orderId || 'N/A'
      }
    };

    paymentIntentParams.automatic_payment_methods = { enabled: true };

    const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams);

    // Persist a pending order in the DB so we keep the full briefing (not limited by Stripe metadata)
    try {
      const { adminDb } = await import('../services/firebase-admin.service');
      if (adminDb) {
        const orderDocRef = adminDb.collection('orders').doc(orderId || `ord_${Date.now()}`);
        const orderSnap = await orderDocRef.get();
        const pendingOrder = {
          id: orderDocRef.id,
          userId: userId || null,
          date: new Date().toISOString(),
          total: Number(amount),
          mainPlanName: mainPlan?.name || (metadata && metadata.mainPlanName) || 'Unknown',
          maintenancePlanName: maintenancePlan?.name || (metadata && metadata.maintenancePlanName) || undefined,
          briefing: briefing || (metadata && metadata.briefing) || undefined,
          paymentMethod: 'pending',
          paymentDetails: null,
          currency: currency,
          status: 'pending'
        };

        // Remove explicit undefined values before saving to Firestore
        Object.keys(pendingOrder).forEach(key => {
          if ((pendingOrder as any)[key] === undefined) {
            delete (pendingOrder as any)[key];
          }
        });

        if (orderSnap.exists) {
          await orderDocRef.update({ ...pendingOrder });
        } else {
          await orderDocRef.set(pendingOrder);
        }
      }
    } catch (e) {
      console.warn('Failed to persist pending order for PaymentIntent', e);
    }

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error: any) {
    console.error(`[Stripe Error] createStripePaymentIntent:`, {
      message: error.message,
      type: error.type,
      code: error.code,
      param: error.param,
      detail: error
    });
    res.status(500).json({ error: error.message || 'Erro interno ao criar intenção de pagamento.' });
  }
};

export const getPaymentIntent = async (req: Request, res: Response) => {
  if (!stripe) {
    return res.status(500).json({ error: 'Stripe is not configured. STRIPE_SECRET_KEY is missing from environment variables.' });
  }

  const { id } = req.params;

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(id);
    res.send({
      paymentIntent,
    });
  } catch (error: any) {
    console.error(`Error retrieving Stripe payment intent for ${id}:`, error);
    res.status(500).json({ error: error.message });
  }
};

export const getCheckoutSession = async (req: Request, res: Response) => {
  if (!stripe) {
    return res.status(500).json({ error: 'Stripe is not configured. STRIPE_SECRET_KEY is missing from environment variables.' });
  }

  const { id } = req.params;

  try {
    const session = await stripe.checkout.sessions.retrieve(id, {
      expand: ['subscription', 'payment_intent'],
    });
    res.send({
      session,
    });
  } catch (error: any) {
    console.error(`Error retrieving Stripe checkout session for ${id}:`, error);
    res.status(500).json({ error: error.message });
  }
};
export const createStripeSubscription = async (req: Request, res: Response) => {
  if (!stripe) {
    return res.status(500).json({ error: 'Stripe is not configured. STRIPE_SECRET_KEY is missing from environment variables.' });
  }

  const { amount, currency, orderId, metadata, userId, maintenancePlan, mainPlan } = req.body;
  console.log(`[Stripe] Creating Subscription: ${amount} ${currency} for order ${orderId}`, { maintenancePlanName: maintenancePlan?.name, mainPlanName: mainPlan?.name });

  if (!amount || amount <= 0 || !currency) {
    return res.status(400).json({ error: 'Invalid amount or currency for subscription.' });
  }

  try {
    const line_items: any[] = [
      {
        price_data: {
          currency: currency.toLowerCase() === 'r$' ? 'brl' : (currency.toLowerCase() === '€' ? 'eur' : currency.toLowerCase()),
          recurring: {
            interval: 'month',
          },
          product_data: {
            name: `Manutenção Nexa - ${maintenancePlan?.name || 'Plano'}`,
            description: 'Cobrança recorrente. O 1º mês é gratuito durante o desenvolvimento.'
          },
          unit_amount: Math.round(Number(amount) * 100),
        },
        quantity: 1,
      },
    ];

    // Se houver um plano principal (Landing Page / Site), adiciona como um item de cobrança ÚNICA
    if (mainPlan) {
      let mainPlanPrice = 0;
      if (typeof mainPlan.price === 'number') {
        mainPlanPrice = mainPlan.price;
      } else {
        // Ex: "R$ 1.500,00" -> 1500.00 | "1500,00" -> 1500.00 | "2.497,99" -> 2497.99
        let cleanStr = String(mainPlan.price).replace(/[A-Za-z$\s]/g, ""); // Remove letras e símbolos
        cleanStr = cleanStr.replace(/\.(?=\d{3})/g, ''); // Remove apenas ponto de milhar
        cleanStr = cleanStr.replace(',', '.'); // Troca vírgula decimal por ponto
        mainPlanPrice = Number(cleanStr);
      }

      if (mainPlanPrice > 0) {
        line_items.push({
          price_data: {
            currency: currency.toLowerCase() === 'r$' ? 'brl' : (currency.toLowerCase() === '€' ? 'eur' : currency.toLowerCase()),
            product_data: {
              name: `Construção: ${mainPlan.name}`,
              description: 'Pagamento único para desenvolvimento do projeto.'
            },
            unit_amount: Math.round(mainPlanPrice * 100),
          },
          quantity: 1,
        });
      }
    }

    const paymentMethodTypes: string[] = ['card'];
    const lowerCurrency = currency.toLowerCase();
    if (lowerCurrency === 'r$' || lowerCurrency === 'brl') {
      paymentMethodTypes.push('boleto');
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: paymentMethodTypes as any,
      mode: 'subscription',
      line_items: line_items,
      metadata: {
        ...(metadata || {}),
        orderId: orderId || 'N/A',
        userId: userId || 'N/A',
        mainPlanName: mainPlan?.name || 'N/A',
        maintenancePlanName: maintenancePlan?.name || 'N/A'
      },
      subscription_data: {
        trial_period_days: 30, // O cliente tem 30 dias de trial na assinatura. O valor do Setup é pago agora, a assinatura começa Mês que vem.
        metadata: {
          userId: userId,
          plan: maintenancePlan?.name,
          orderId: orderId,
          mainPlanName: mainPlan?.name
        }
      },
      // Note: Full branding (Logos, Custom Background Colors) must be set via the Stripe Dashboard -> Settings -> Branding.
      // E não diretamente via Código API para as sessões, mas podemos customizar alguns detalhes de consentimento.
      consent_collection: {
        terms_of_service: 'required',
      },
      custom_text: {
        submit: {
          message: 'Você concorda em iniciar o projeto hoje. A manutenção iniciará após 30 dias de carência.',
        },
      },
      locale: 'pt-BR',
      success_url: `${req.headers.origin || 'http://localhost:5173'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin || 'http://localhost:5173'}/pagamento`,
    });

    // We can persist a pending order here just like in the regular flow, to attach the website config
    try {
      const { adminDb } = await import('../services/firebase-admin.service');
      if (adminDb) {
        const orderDocRef = adminDb.collection('orders').doc(orderId || `ord_${Date.now()}`);
        const orderSnap = await orderDocRef.get();
        const pendingOrder = {
          id: orderDocRef.id,
          userId: userId || null,
          date: new Date().toISOString(),
          total: Number(amount), // this will represent the recurring amount
          mainPlanName: mainPlan?.name || (metadata && metadata.mainPlanName) || 'Unknown',
          maintenancePlanName: maintenancePlan?.name || (metadata && metadata.maintenancePlanName) || undefined,
          paymentMethod: 'subscription_card',
          paymentDetails: null,
          currency: currency,
          status: 'pending_subscription',
          checkoutSessionId: session.id,
        };

        Object.keys(pendingOrder).forEach(key => {
          if ((pendingOrder as any)[key] === undefined) {
            delete (pendingOrder as any)[key];
          }
        });

        if (orderSnap.exists) {
          await orderDocRef.update({ ...pendingOrder });
        } else {
          await orderDocRef.set(pendingOrder);
        }
      }
    } catch (e) {
      console.warn('Failed to persist pending order for Subscription', e);
    }

    res.json({ url: session.url });
  } catch (error: any) {
    console.error(`[Stripe Error] createStripeSubscription:`, {
      message: error.message,
      type: error.type,
      code: error.code,
      detail: error
    });
    // Garante que a string do erro de fato seja exposta ao frontend (Stripe envia raw error também)
    const errorMsg = typeof error.message === 'string' ? error.message :
      (typeof error === 'string' ? error : JSON.stringify(error));
    res.status(500).json({ error: errorMsg || 'Erro interno ao criar assinatura.' });
  }
};
