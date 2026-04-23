import { Router } from 'express'
import { profileController } from '../controllers/profile.controller.js'
import { authenticate } from '../middlewares/auth.js'

const router = Router()

router.get('/', authenticate, profileController.getProfile)
router.put('/', authenticate, profileController.updateProfile)
router.get(
  '/subscription',
  authenticate,
  profileController.getSubscriptionStatus
)

export default router
