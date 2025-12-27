import { Router } from 'express';
import {
  createStripePaymentIntent,
  getPaymentIntent,
} from '../controllers/payment.controller';
import { authenticate } from '../controllers/auth.controller';
import { rateLimitAndSanitize } from '../middleware/sanitize-middleware';

const router = Router();

// Route for Stripe payment intent
router.post('/create-stripe-payment-intent', authenticate, rateLimitAndSanitize, createStripePaymentIntent);
router.get('/stripe-payment-intent/:id', authenticate, rateLimitAndSanitize, getPaymentIntent);

export default router;
