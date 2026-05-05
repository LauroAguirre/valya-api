import { Router } from 'express'
import { authenticate, authorizeRoles } from '../middlewares/auth.js'
import { searchAgentsController } from '../controllers/agents/searchAgentsController.js'
import { removeCompanyAgentController } from '../controllers/agents/removeCompanyAgentController.js'
import { getClientDetailController } from '../controllers/users/getClientDetailController.js'
import { listAdminUsersController } from '../controllers/users/listAdminUsersController.js'
import { getAdminUserController } from '../controllers/users/getAdminUserController.js'
import { toggleAdminUserController } from '../controllers/users/toggleAdminUserController.js'

const router = Router()

router.use(authenticate)

router.get('/search', authorizeRoles('CLIENT'), searchAgentsController)
router.delete('/:id/remove', authorizeRoles('CLIENT'), removeCompanyAgentController)

router.get('/clients/:id', authorizeRoles('ADMIN'), getClientDetailController)
router.get('/users', authorizeRoles('ADMIN'), listAdminUsersController)
router.get('/users/:id', authorizeRoles('ADMIN'), getAdminUserController)
router.patch('/users/:id/toggle', authorizeRoles('ADMIN'), toggleAdminUserController)

export default router
