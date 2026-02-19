import express from 'express';
import { protect } from '../middleware/auth.js';
import { verifyAdmin } from '../middleware/admin.js';
import { getVerificationBadge, revokeBadge } from '../controllers/verificationController.js';

const router = express.Router();

router.use(protect);

// GET badge (user or admin can query)
router.get('/:userId', getVerificationBadge);

// Admin revoke badge
router.post('/:userId/revoke', verifyAdmin, revokeBadge);

export default router;
