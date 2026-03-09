import { Router } from 'express';
import {
  createStripePaymentIntent,
  createStripeSubscription,
  getPaymentIntent,
  getCheckoutSession,
} from '../controllers/payment.controller';
import { authenticate } from '../controllers/auth.controller';
import { rateLimitAndSanitize } from '../middleware/sanitize-middleware';

const router = Router();

// Route for Stripe payment intent
// For local/dev testing we allow creating payment intent without authentication.
router.post('/create-stripe-payment-intent', rateLimitAndSanitize, createStripePaymentIntent);
router.post('/create-maintenance-subscription', rateLimitAndSanitize, createStripeSubscription);
router.get('/stripe-payment-intent/:id', authenticate, rateLimitAndSanitize, getPaymentIntent);
router.get('/checkout-session/:id', authenticate, rateLimitAndSanitize, getCheckoutSession);

export default router;
