import { Router } from 'express';
import { getUserOrders, createOrder, updateOrderProgress } from '../controllers/orders.controller';
import { authenticate, isAdmin } from '../controllers/auth.controller';
import { validateOrder } from '../middleware/validate-order';

const router = Router();

router.get('/', authenticate, getUserOrders);
router.post('/', authenticate, validateOrder, createOrder);
router.patch('/:id/progress', authenticate, isAdmin, updateOrderProgress);

export default router;
