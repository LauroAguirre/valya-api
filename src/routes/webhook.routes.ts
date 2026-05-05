import { Router } from 'express'
import { authenticate, authorizeRoles } from '../middlewares/auth.js'
import { asaasWebhook } from '@/controllers/webhooks/asaasWebhook.js'
import { evolutionWebhook } from '@/controllers/webhooks/evolutionWebhook.js'
import { evolutionConnectionWebhook } from '@/controllers/webhooks/evolutionConnectionWebhook.js'
import { createCustomerController } from '@/controllers/asaas/createCustomerController.js'
import { createSubscriptionController } from '@/controllers/asaas/createSubscriptionController.js'
import { evolutionQRCodeWebhook } from '@/controllers/webhooks/evolutionQRCodeWebhook.js'
import { evolutionMsgEditWebhook } from '@/controllers/webhooks/evolutionMsgEditWebhook.js'
import { evolutionLogoutWebhook } from '@/controllers/webhooks/evolutionLogoutWebhook.js'
import { evolutionContactsWebhook } from '@/controllers/webhooks/evolutionContactsWebhook.js'
import { evolutionSendMessageWebhook } from '@/controllers/webhooks/evolutionSendMessageWebhook.js'
import { evolutionMsgDeleteWebhook } from '@/controllers/webhooks/evolutionMsgDeleteWebhook.js'
import { evolutionMsgUpdateWebhook } from '@/controllers/webhooks/evolutionMsgUpdateWebhook.js'
import {
  evolutionLabelsAssociationWebhook,
  evolutionLabelsEditWebhook
} from '@/controllers/webhooks/evolutionLabelsWebhook.js'
import { evolutionInstanceWebhook } from '@/controllers/webhooks/evolutionInstanceWebhook.js'

const router = Router()

// Webhooks publicos (chamados por servicos externos)
router.post('/evolution', evolutionWebhook)
router.post('/evolution/connection-update', evolutionConnectionWebhook)
router.post('/evolution/qrcode-updated', evolutionQRCodeWebhook)
router.post('/evolution/messages-edited', evolutionMsgEditWebhook)
router.post('/evolution/logout-instance', evolutionLogoutWebhook)
router.post('/evolution/contacts-upsert', evolutionContactsWebhook)
router.post('/evolution/contacts-update', evolutionContactsWebhook)
router.post('/evolution/send-message', evolutionSendMessageWebhook)
router.post('/evolution/messages-delete', evolutionMsgDeleteWebhook)
router.post('/evolution/messages-update', evolutionMsgUpdateWebhook)
router.post('/evolution/send-message-update', evolutionMsgUpdateWebhook)
router.post('/evolution/labels-association', evolutionLabelsAssociationWebhook)
router.post('/evolution/labels-edit', evolutionLabelsEditWebhook)
router.post('/evolution/instance', evolutionInstanceWebhook)
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
