import { Router } from 'express';
import { getUserOrders, createOrder } from '../controllers/orders.controller';

const router = Router();

router.get('/', getUserOrders as any);
router.post('/', createOrder as any);

export default router;
