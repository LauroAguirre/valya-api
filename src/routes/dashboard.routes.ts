import { Router } from 'express';
import { dashboardController } from '../controllers/dashboard.controller.js';
import { authenticate, authorizeRoles } from '../middlewares/auth.js';

const router = Router();

router.get('/client', authenticate, authorizeRoles('CLIENT'), dashboardController.getClientDashboard);
router.get('/admin', authenticate, authorizeRoles('ADMIN'), dashboardController.getAdminDashboard);

export default router;
