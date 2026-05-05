import { Router } from 'express'
import { authenticate, authorizeRoles } from '../middlewares/auth.js'
import { getCompanyAgentsController } from '../controllers/company/getCompanyAgentsController.js'
import { linkAgentController } from '../controllers/agents/linkAgentController.js'
import { createAndLinkAgentController } from '../controllers/agents/createAndLinkAgentController.js'

const router = Router()

router.use(authenticate, authorizeRoles('CLIENT'))

router.get('/:id/agents', getCompanyAgentsController)
router.post('/:id/agents/:agentId', linkAgentController)
router.post('/:id/agents', createAndLinkAgentController)

export default router
