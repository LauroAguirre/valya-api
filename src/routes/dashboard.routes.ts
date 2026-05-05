import { Router } from 'express'
import { authenticate, authorizeRoles } from '../middlewares/auth.js'
import { getAdminDashboardController } from '@/controllers/dashboard/getDashboardController.js'
import { UserRole } from '@prisma/client'
import { getClientDashboardKpisController } from '@/controllers/dashboard/getClientDashboardKpisController.js'
import { getLeadsMonthlyChartController } from '@/controllers/dashboard/getLeadsMonthlyChartController.js'

const router = Router()

router.get(
  '/client/:userId/kpis',
  authenticate,
  authorizeRoles(UserRole.CLIENT),
  getClientDashboardKpisController
)
router.get(
  '/client/:userId/leadsChart',
  authenticate,
  authorizeRoles(UserRole.CLIENT),
  getLeadsMonthlyChartController
)
router.get(
  '/admin',
  authenticate,
  authorizeRoles(UserRole.ADMIN),
  getAdminDashboardController
)

export default router
