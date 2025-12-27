import { Router } from 'express';
import { getUserOrders, createOrder } from '../controllers/orders.controller';
import { rateLimitAndSanitize } from '../middleware/sanitize-middleware';

const router = Router();

router.get('/', rateLimitAndSanitize, getUserOrders as any);
router.post('/', rateLimitAndSanitize, createOrder as any);

export default router;
