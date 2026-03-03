import { Router } from 'express';
import { webhookController } from '../controllers/webhook.controller.js';
import { asaasController } from '../controllers/asaas.controller.js';
import { authenticate, authorizeRoles } from '../middlewares/auth.js';

const router = Router();

// Webhooks publicos (chamados por servicos externos)
router.post('/evolution', webhookController.evolutionWebhook);
router.post('/asaas', webhookController.asaasWebhook);

// Rotas de cadastro Asaas (requerem autenticacao)
router.post('/asaas/customer', authenticate, authorizeRoles('CLIENT'), asaasController.createCustomer);
router.post('/asaas/subscription', authenticate, authorizeRoles('CLIENT'), asaasController.createSubscription);

export default router;
