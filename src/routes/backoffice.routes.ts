import { Router } from 'express';
import { backofficeController } from '../controllers/backoffice.controller.js';
import { authenticate, authorizeRoles } from '../middlewares/auth.js';

const router = Router();

router.use(authenticate, authorizeRoles('ADMIN'));

router.get('/dashboard', backofficeController.getDashboard);
router.get('/clients', backofficeController.listClients);
router.get('/clients/:id', backofficeController.getClientDetail);
router.get('/users', backofficeController.listAdminUsers);
router.get('/users/:id', backofficeController.getAdminUser);
router.patch('/users/:id/toggle', backofficeController.toggleAdminUser);

export default router;
