import { Router } from 'express'
import { authenticate, authorizeRoles } from '../middlewares/auth.js'
import { listLeadsController } from '@/controllers/leads/listLeadsController.js'
import { getByIdController } from '@/controllers/leads/getByIdController.js'
import { getMessagesController } from '@/controllers/leads/getMessagesController.js'
import { saveLeadController } from '@/controllers/leads/saveLeadController.js'
import { toggleAiController } from '@/controllers/leads/toggleAiController.js'

const router = Router()

router.use(authenticate, authorizeRoles('CLIENT'))

router.get('/', listLeadsController)
router.get('/:id', getByIdController)
router.get('/:id/messages', getMessagesController)
router.post('/', saveLeadController)
// router.put('/:id', leadController.update);
// router.patch('/:id/stage', leadController.updateStage)
router.patch('/:id/toggle-ai', toggleAiController)

export default router
