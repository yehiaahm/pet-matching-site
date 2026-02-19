import express from 'express';
import { getTerms, getPrivacy } from '../controllers/legalController.js';

const router = express.Router();

router.get('/terms', getTerms);
router.get('/privacy', getPrivacy);

export default router;
