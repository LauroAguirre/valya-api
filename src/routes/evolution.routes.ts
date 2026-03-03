import { Router } from 'express';
import { evolutionController } from '../controllers/evolution.controller.js';
import { authenticate, authorizeRoles } from '../middlewares/auth.js';

const router = Router();

router.use(authenticate, authorizeRoles('CLIENT'));

router.post('/instance', evolutionController.createInstance);
router.get('/qrcode', evolutionController.getQrCode);
router.get('/status', evolutionController.getConnectionStatus);
router.delete('/disconnect', evolutionController.disconnect);

export default router;
