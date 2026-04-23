import { Router } from 'express'

import { validate } from '../middlewares/validate.js'
import { authenticate } from '../middlewares/auth.js'
import {
  // registerSchema,
  loginSchema,
  forgotPasswordSchema,
  verifyCodeSchema,
  resetPasswordSchema,
  oauthSchema
} from '../schemas/auth.schema.js'
import { loginController } from '@/controllers/users/loginController.js'
import { agentRegisterController } from '@/controllers/users/agentRegisterController.js'
import { oauthLoginController } from '@/controllers/users/oauthLoginController.js'
import { forgotPasswordController } from '@/controllers/users/forgotPasswordController.js'
import { verifyResetCodeController } from '@/controllers/users/verifyResetCodeController.js'
import { resetPasswordController } from '@/controllers/users/resetPasswordController.js'
// import { getUserController } from '@/controllers/users/getUserController.js'
import { userProfileController } from '@/controllers/users/userProfileController.js'

const router = Router()

// router.get('/me', authenticate, getUserController)
router.get('/profile', authenticate, userProfileController)

router.post('/agent/register', agentRegisterController)
router.post('/login', validate(loginSchema), loginController)
router.post('/oauth', validate(oauthSchema), oauthLoginController)
router.post(
  '/forgot-password',
  validate(forgotPasswordSchema),
  forgotPasswordController
)
router.post(
  '/verify-code',
  validate(verifyCodeSchema),
  verifyResetCodeController
)
router.post(
  '/reset-password',
  validate(resetPasswordSchema),
  resetPasswordController
)

export default router
