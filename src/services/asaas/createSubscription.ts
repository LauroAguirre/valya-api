import prisma from "@/config/database";
import { AsaasApi } from "@/providers/asaasApi";
import { SubscriptionStatus } from "@prisma/client";

export const createSubscription = async (clientId: string, params: { value: number; dueDate: string; description?: string }) =>{
  const asaasCustomer = await prisma.asaasCustomer.findUnique({ where: { clientId } });
    if (!asaasCustomer) throw new Error('Cliente nao cadastrado na Asaas. Cadastre primeiro.');

  const asaas = AsaasApi()

  const newSubscription = await asaas.post('/subscriptions', {
      customer: asaasCustomer.asaasCustomerId, billingType: 'UNDEFINED', value: params.value,
      nextDueDate: params.dueDate, cycle: 'MONTHLY',
      description: params.description || 'Assinatura Valya - Plano Mensal', externalReference: clientId,
  }).then(result => {
    return result.data
  })
  .catch(error => {
    console.error('ASAAS ERROR: ', error)
    if (error.response.status === 400) {
      throw new Error(error.response.data.errors[0].description)
    } else {
      throw new Error(error.response)
    }
  })

    // const res = await fetch(`${ASAAS_URL}/subscriptions`, {
    //   method: 'POST', headers: headers(),
    //   body: JSON.stringify({
    //     customer: asaasCustomer.asaasCustomerId, billingType: 'UNDEFINED', value: params.value,
    //     nextDueDate: params.dueDate, cycle: 'MONTHLY',
    //     description: params.description || 'Assinatura Valya - Plano Mensal', externalReference: clientId,
    //   }),
    // });

    // if (!res.ok) {
    //   const error = await res.json().catch(() => ({}));
    //   throw new Error(`Erro ao criar assinatura: ${JSON.stringify(error)}`);
    // }

    // const subscription = await res.json();

    await prisma.subscription.update({ where: { clientId }, data: { asaasSubId: newSubscription.id, status: SubscriptionStatus.ACTIVE } });
    return newSubscription;
}