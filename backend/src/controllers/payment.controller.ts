import { Request, Response } from 'express';
import Stripe from 'stripe';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

if (!STRIPE_SECRET_KEY) {
  console.error('FATAL ERROR: STRIPE_SECRET_KEY is not defined. Stripe payments will not be available. Please set this environment variable.');
  // In a real application, you might want to exit the process or disable payment routes.
}

const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY) : null;

// Mercado Pago integration removed; Stripe handles payments now.

export const createStripePaymentIntent = async (req: Request, res: Response) => {
  if (!stripe) {
    return res.status(500).json({ error: 'Stripe is not configured. STRIPE_SECRET_KEY is missing from environment variables.' });
  }

  const { amount, currency, orderId, metadata, briefing, userId, mainPlan, maintenancePlan, clientName, clientEmail, payment_method_types } = req.body;

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

    // Se o frontend pedir métodos específicos (ex: Pix no componente customizado), usamos eles.
    // Caso contrário, usamos os métodos automáticos do painel Stripe.
    if (payment_method_types && Array.isArray(payment_method_types) && payment_method_types.length > 0) {
      paymentIntentParams.payment_method_types = payment_method_types;
    } else {
      paymentIntentParams.automatic_payment_methods = { enabled: true };
    }

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
          status: 'pending',
          invoiceUrl: undefined,
        };

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
    console.error(`Error creating Stripe payment intent for ${currency}:`, error);
    res.status(500).json({ error: error.message });
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
export const createStripeSubscription = async (req: Request, res: Response) => {
  if (!stripe) {
    return res.status(500).json({ error: 'Stripe is not configured. STRIPE_SECRET_KEY is missing from environment variables.' });
  }

  const { amount, currency, orderId, metadata, userId, maintenancePlan, mainPlan } = req.body;

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
            description: 'Cobrança mensal recorrente após o primeiro mês.'
          },
          unit_amount: Math.round(Number(amount) * 100),
        },
        quantity: 1,
      },
    ];

    // Se houver um plano principal (Landing Page / Site), adiciona como um item de cobrança ÚNICA
    if (mainPlan) {
      const mainPlanPrice = Number(String(mainPlan.price).replace(/[^0-9.-]+/g, ""));
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
        metadata: {
          userId: userId,
          plan: maintenancePlan?.name,
          orderId: orderId,
          mainPlanName: mainPlan?.name
        }
      },
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
    console.error(`Error creating Stripe subscription for ${currency}:`, error);
    res.status(500).json({ error: error.message });
  }
};
