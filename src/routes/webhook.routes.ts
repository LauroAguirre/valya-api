import { Router } from 'express'
import { authenticate, authorizeRoles } from '../middlewares/auth.js'
import { asaasWebhook } from '@/controllers/webhooks/asaasWebhook.js'
import { evolutionWebhook } from '@/controllers/webhooks/evolutionWebhook.js'
import { createCustomerController } from '@/controllers/asaas/createCustomerController.js'
import { createSubscriptionController } from '@/controllers/asaas/createSubscriptionController.js'

const router = Router()

// Webhooks publicos (chamados por servicos externos)
router.post('/evolution', evolutionWebhook)
router.post('/asaas', asaasWebhook)

// Rotas de cadastro Asaas (requerem autenticacao)
router.post(
  '/asaas/customer',
  authenticate,
  authorizeRoles('CLIENT'),
  createCustomerController
)
router.post(
  '/asaas/subscription',
  authenticate,
  authorizeRoles('CLIENT'),
  createSubscriptionController
)

export default router
