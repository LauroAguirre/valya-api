import { Router } from 'express'
import { authenticate, authorizeRoles } from '../middlewares/auth.js'
import { createInstanceController } from '@/controllers/evolution/createInstanceController.js'
import { getQrCodeController } from '@/controllers/evolution/getQrCodeController.js'
import { getConnectionStatusController } from '@/controllers/evolution/getConnectionStatuscontroller.js'
import { evolutionDisconnectController } from '@/controllers/evolution/disconnectController.js'

const router = Router()

router.use(authenticate, authorizeRoles('CLIENT'))

router.post('/instance', createInstanceController)
router.get('/qrcode', getQrCodeController)
router.get('/status', getConnectionStatusController)
router.delete('/disconnect', evolutionDisconnectController)

export default router
