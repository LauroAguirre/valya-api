import { env } from '../config/env.js';
import prisma from '../config/database.js';
import { emailService } from './email.service.js';

const ASAAS_URL = env.ASAAS_API_URL;
const API_KEY = env.ASAAS_API_KEY;

function headers() {
  return {
    'Content-Type': 'application/json',
    access_token: API_KEY,
  };
}

export const asaasService = {
  /**
   * Cadastrar cliente na Asaas
   */
  async createCustomer(
    userId: string,
    data: {
      cpfCnpj: string;
      name: string;
      email: string;
      phone?: string;
      postalCode?: string;
      address?: string;
      addressNumber?: string;
    }
  ) {
    // Verificar se ja existe
    const existing = await prisma.asaasCustomer.findUnique({ where: { userId } });
    if (existing) {
      throw new Error('Cliente ja cadastrado na Asaas.');
    }

    const res = await fetch(`${ASAAS_URL}/customers`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({
        name: data.name,
        cpfCnpj: data.cpfCnpj,
        email: data.email,
        phone: data.phone,
        postalCode: data.postalCode,
        address: data.address,
        addressNumber: data.addressNumber,
        externalReference: userId,
      }),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(`Erro ao cadastrar na Asaas: ${JSON.stringify(error)}`);
    }

    const customer = await res.json();

    // Salvar no banco local
    const asaasCustomer = await prisma.asaasCustomer.create({
      data: {
        userId,
        asaasCustomerId: customer.id,
        cpfCnpj: data.cpfCnpj,
        name: data.name,
        email: data.email,
        phone: data.phone,
        postalCode: data.postalCode,
        address: data.address,
        addressNumber: data.addressNumber,
      },
    });

    return asaasCustomer;
  },

  /**
   * Criar assinatura na Asaas
   */
  async createSubscription(
    userId: string,
    params: { value: number; dueDate: string; description?: string }
  ) {
    const asaasCustomer = await prisma.asaasCustomer.findUnique({ where: { userId } });
    if (!asaasCustomer) {
      throw new Error('Cliente nao cadastrado na Asaas. Cadastre primeiro.');
    }

    const res = await fetch(`${ASAAS_URL}/subscriptions`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({
        customer: asaasCustomer.asaasCustomerId,
        billingType: 'UNDEFINED', // Permite PIX, boleto, cartao
        value: params.value,
        nextDueDate: params.dueDate,
        cycle: 'MONTHLY',
        description: params.description || 'Assinatura Valya - Plano Mensal',
        externalReference: userId,
      }),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(`Erro ao criar assinatura: ${JSON.stringify(error)}`);
    }

    const subscription = await res.json();

    // Atualizar assinatura no banco local
    await prisma.subscription.update({
      where: { userId },
      data: {
        asaasSubId: subscription.id,
        status: 'ACTIVE',
      },
    });

    return subscription;
  },

  /**
   * Processar webhook de pagamento da Asaas
   */
  async handlePaymentWebhook(event: string, payment: Record<string, unknown>) {
    const externalReference = payment.externalReference as string;

    if (!externalReference) {
      console.warn('[Asaas Webhook] Pagamento sem externalReference');
      return;
    }

    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { id: externalReference },
      include: { subscription: true },
    });

    if (!user || !user.subscription) {
      console.warn(`[Asaas Webhook] Usuario nao encontrado: ${externalReference}`);
      return;
    }

    switch (event) {
      case 'PAYMENT_CONFIRMED':
      case 'PAYMENT_RECEIVED': {
        const amount = payment.value as number;
        const paidAt = new Date();
        const nextDueDate = new Date(user.subscription.expiresAt);
        nextDueDate.setMonth(nextDueDate.getMonth() + 1);

        // Registrar pagamento
        await prisma.payment.create({
          data: {
            subscriptionId: user.subscription.id,
            asaasPaymentId: payment.id as string,
            amount,
            status: 'CONFIRMED',
            paidAt,
            dueDate: new Date(payment.dueDate as string),
          },
        });

        // Renovar assinatura
        await prisma.subscription.update({
          where: { id: user.subscription.id },
          data: {
            status: 'ACTIVE',
            expiresAt: nextDueDate,
          },
        });

        // Enviar e-mail de confirmacao
        await emailService.sendPaymentConfirmed(
          user.email,
          user.name,
          amount,
          nextDueDate.toLocaleDateString('pt-BR')
        );

        console.log(`[Asaas Webhook] Pagamento confirmado para ${user.email}`);
        break;
      }

      case 'PAYMENT_OVERDUE': {
        // Registrar pagamento como vencido
        await prisma.payment.create({
          data: {
            subscriptionId: user.subscription.id,
            asaasPaymentId: payment.id as string,
            amount: payment.value as number,
            status: 'OVERDUE',
            dueDate: new Date(payment.dueDate as string),
          },
        });

        // Enviar e-mail de falha
        await emailService.sendPaymentFailed(
          user.email,
          user.name,
          new Date(payment.dueDate as string).toLocaleDateString('pt-BR')
        );

        console.log(`[Asaas Webhook] Pagamento vencido para ${user.email}`);
        break;
      }

      case 'PAYMENT_REFUNDED': {
        await prisma.payment.updateMany({
          where: { asaasPaymentId: payment.id as string },
          data: { status: 'REFUNDED' },
        });
        break;
      }

      default:
        console.log(`[Asaas Webhook] Evento nao tratado: ${event}`);
    }
  },
};
