import { Router } from 'express'
// import { backofficeController } from '../controllers/backoffice.controller.js'
import { authenticate, authorizeRoles } from '../middlewares/auth.js'
// import { getDashboardController } from '@/controllers/dashboard/getDashboardController.js'
import { listClientsController } from '@/controllers/users/listClientsController.js'
import { getClientDetailController } from '@/controllers/users/getClientDetailController.js'
import { listAdminUsersController } from '@/controllers/users/listAdminUsersController.js'
import { getAdminUserController } from '@/controllers/users/getAdminUserController.js'
import { toggleAdminUserController } from '@/controllers/users/toggleAdminUserController.js'

const router = Router()

router.use(authenticate, authorizeRoles('ADMIN'))

// router.get('/dashboard', getDashboardController)
router.get('/clients', listClientsController)
router.get('/clients/:id', getClientDetailController)
router.get('/users', listAdminUsersController)
router.get('/users/:id', getAdminUserController)
router.patch('/users/:id/toggle', toggleAdminUserController)

export default router
