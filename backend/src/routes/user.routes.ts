import { Router } from 'express';
import { updateProfile, deleteAccount } from '../controllers/user.controller';
import { authenticate } from '../controllers/auth.controller';

const router = Router();

router.put('/profile', authenticate, updateProfile);
router.delete('/profile', authenticate, deleteAccount);

export default router;