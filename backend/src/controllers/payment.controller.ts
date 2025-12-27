import { Request, Response } from 'express';
import Stripe from 'stripe';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

if (!STRIPE_SECRET_KEY) {
  console.error('FATAL ERROR: STRIPE_SECRET_KEY is not defined. Stripe payments will not be available. Please set this environment variable.');
  // In a real application, you might want to exit the process or disable payment routes.
}

const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY) : null;

export const createStripePaymentIntent = async (req: Request, res: Response) => {
  if (!stripe) {
    return res.status(500).json({ error: 'Stripe is not configured. STRIPE_SECRET_KEY is missing from environment variables.' });
  }

  const { amount, currency, orderId, payment_method_types: req_payment_method_types, metadata } = req.body;

  if (!amount || amount <= 0 || !currency) {
    return res.status(400).json({ error: 'Invalid amount or currency for payment.' });
  }

  let payment_method_types: string[];

  if (req_payment_method_types && Array.isArray(req_payment_method_types)) {
    payment_method_types = req_payment_method_types;
  } else {
    // Default payment method types based on currency if not explicitly provided
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
      default:
        payment_method_types = ['card'];
        break;
    }
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(Number(amount) * 100), // Stripe works with cents, ensure amount is a number
      currency: currency,
      payment_method_types: payment_method_types,
      metadata: metadata || {
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

