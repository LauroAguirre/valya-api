import { Router } from 'express';
import { aiConfigController } from '../controllers/aiConfig.controller.js';
import { authenticate, authorizeRoles } from '../middlewares/auth.js';

const router = Router();

router.use(authenticate, authorizeRoles('CLIENT'));

router.get('/', aiConfigController.get);
router.put('/', aiConfigController.update);

export default router;
