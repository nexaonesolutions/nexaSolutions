import { Router } from 'express';
import { updateProfile } from '../controllers/user.controller';
import { authenticate } from '../auth';

const router = Router();

router.put('/profile', authenticate, updateProfile);

export default router;