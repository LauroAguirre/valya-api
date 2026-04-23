import prisma from "@/config/database";
import { emailService } from "@/services/email.service";

export const handlePaymentWebhook = async (event: string, payment: Record<string, unknown>) =>{
  const externalReference = payment.externalReference as string;
  if (!externalReference) { console.warn('[Asaas Webhook] Pagamento sem externalReference'); return; }

  const user = await prisma.client.findUnique({ where: { id: externalReference }, include: { subscription: true } });
  if (!user || !user.subscription) { console.warn(`[Asaas Webhook] Usuario nao encontrado: ${externalReference}`); return; }

  switch (event) {
    case 'PAYMENT_CONFIRMED':
    case 'PAYMENT_RECEIVED': {
      const amount = payment.value as number;
      const paidAt = new Date();
      const nextDueDate = new Date(user.subscription.expiresAt);
      nextDueDate.setMonth(nextDueDate.getMonth() + 1);

      await prisma.payment.create({
        data: { subscriptionId: user.subscription.id, asaasPaymentId: payment.id as string, amount, status: 'CONFIRMED', paidAt, dueDate: new Date(payment.dueDate as string) },
      });

      await prisma.subscription.update({ where: { id: user.subscription.id }, data: { status: 'ACTIVE', expiresAt: nextDueDate } });
      await emailService.sendPaymentConfirmed(user.email, user.name, amount, nextDueDate.toLocaleDateString('pt-BR'));
      console.log(`[Asaas Webhook] Pagamento confirmado para ${user.email}`);
      break;
    }

    case 'PAYMENT_OVERDUE': {
      await prisma.payment.create({
        data: { subscriptionId: user.subscription.id, asaasPaymentId: payment.id as string, amount: payment.value as number, status: 'OVERDUE', dueDate: new Date(payment.dueDate as string) },
      });
      await emailService.sendPaymentFailed(user.email, user.name, new Date(payment.dueDate as string).toLocaleDateString('pt-BR'));
      console.log(`[Asaas Webhook] Pagamento vencido para ${user.email}`);
      break;
    }

    case 'PAYMENT_REFUNDED': {
      await prisma.payment.updateMany({ where: { asaasPaymentId: payment.id as string }, data: { status: 'REFUNDED' } });
      break;
    }

    default:
      console.log(`[Asaas Webhook] Evento nao tratado: ${event}`);
  }
}
