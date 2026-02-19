import express from 'express';
import { getClinicInfo, getServices, getServiceById } from '../controllers/clinicController.js';
const router = express.Router();

// Public routes
router.get('/info', getClinicInfo);
router.get('/services', getServices);
router.get('/services/:serviceId', getServiceById);

export default router;
