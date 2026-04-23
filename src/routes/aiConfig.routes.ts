import { Router } from 'express'
import { authenticate, authorizeRoles } from '../middlewares/auth.js'
import { getAiConfigsController } from '@/controllers/configs/getAiConfigsController.js'
import { saveAiConfigsController } from '@/controllers/configs/saveAiConfigsController.js'

const router = Router()

router.use(authenticate, authorizeRoles('CLIENT'))

router.get('/', getAiConfigsController)
router.post('/', saveAiConfigsController)

export default router
