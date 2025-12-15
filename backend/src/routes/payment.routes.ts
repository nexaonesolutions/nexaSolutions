import { Router } from 'express';
import {
  createStripePaymentIntent,
} from '../controllers/payment.controller';

const router = Router();

// Route for Stripe payment intent
router.post('/create-stripe-payment-intent', createStripePaymentIntent);

export default router;
