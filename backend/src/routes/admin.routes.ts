import { Router } from 'express';
import { getAllUsers, getDashboardStats, getAllOrders, getAllChats, getRecentActivity, logPaymentAttempt } from '../controllers/admin.controller';
import { authenticate, isAdmin } from '../controllers/auth.controller';

const router = Router();

// All admin routes require authentication + admin role
router.get('/stats', authenticate, isAdmin, getDashboardStats);
router.get('/users', authenticate, isAdmin, getAllUsers);
router.get('/orders', authenticate, isAdmin, getAllOrders);
router.get('/chats', authenticate, isAdmin, getAllChats);
router.get('/activity', authenticate, isAdmin, getRecentActivity);
router.post('/activity/log', authenticate, logPaymentAttempt); // Allow any logged-in user to log their attempt

export default router;
