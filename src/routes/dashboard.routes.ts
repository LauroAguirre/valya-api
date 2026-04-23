import { Router } from 'express'
import { authenticate, authorizeRoles } from '../middlewares/auth.js'
import { getAdminDashboardController } from '@/controllers/dashboard/getDashboardController.js'
import { UserRole } from '@prisma/client'
import { getClientDashboardController } from '@/controllers/dashboard/getClientDashboardController.js'

const router = Router()

router.get(
  '/client',
  authenticate,
  authorizeRoles(UserRole.CLIENT),
  getClientDashboardController
)
router.get(
  '/admin',
  authenticate,
  authorizeRoles(UserRole.ADMIN),
  getAdminDashboardController
)

export default router
