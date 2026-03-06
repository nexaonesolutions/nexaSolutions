import { Router } from 'express';
import { getMessages, sendMessage, sendNexaMessage, getUserMessages } from '../controllers/chat.controller';
import { authenticate, isAdmin } from '../controllers/auth.controller';

const router = Router();

// Get all messages for the authenticated user (for ChatWidget visibility check)
router.get('/user', authenticate, getUserMessages);

// Get messages for a specific order
router.get('/:orderId', authenticate, getMessages);

// Client sends a message
router.post('/:orderId', authenticate, sendMessage);

// NEXA admin sends a message (requires admin role)
router.post('/:orderId/nexa', authenticate, isAdmin, sendNexaMessage);

export default router;
