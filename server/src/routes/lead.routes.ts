import { Router } from 'express';
import { leadController } from '../controllers/lead.controller.js';
import { authenticate, authorizeRoles } from '../middlewares/auth.js';

const router = Router();

router.use(authenticate, authorizeRoles('CLIENT'));

router.get('/', leadController.listByStage);
router.get('/:id', leadController.getById);
router.get('/:id/messages', leadController.getMessages);
router.post('/', leadController.create);
router.put('/:id', leadController.update);
router.patch('/:id/stage', leadController.updateStage);
router.patch('/:id/toggle-ai', leadController.toggleAi);

export default router;
