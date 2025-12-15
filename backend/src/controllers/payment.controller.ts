import { Request, Response } from 'express';
import Stripe from 'stripe';

console.log('Valor de STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY);
let stripe: Stripe | null = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
} else {
  console.warn('STRIPE_SECRET_KEY is not defined. Stripe payments will not be available.');
}

export const createStripePaymentIntent = async (req: Request, res: Response) => {
  if (!stripe) {
    return res.status(500).json({ error: 'Stripe is not configured. STRIPE_SECRET_KEY is missing.' });
  }

  const { amount, currency, orderId, payment_method_types: req_payment_method_types } = req.body;

  if (!amount || amount <= 0 || !currency) {
    return res.status(400).json({ error: 'Invalid amount or currency for payment.' });
  }

  let payment_method_types: string[];

  if (req_payment_method_types) {
    payment_method_types = req_payment_method_types;
  } else {
    payment_method_types = ['card'];
    switch (currency.toLowerCase()) {
      case 'brl':
        payment_method_types = ['card', 'pix'];
        break;
      case 'usd':
        payment_method_types = ['card', 'us_bank_account'];
        break;
      case 'eur':
        payment_method_types = ['card', 'sepa_debit'];
        break;
    }
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe works with cents
      currency: currency,
      payment_method_types: payment_method_types,
      metadata: {
        order_id: orderId || 'N/A'
      }
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error: any) {
    console.error(`Error creating Stripe payment intent for ${currency}:`, error);
    res.status(500).json({ error: error.message });
  }
};

