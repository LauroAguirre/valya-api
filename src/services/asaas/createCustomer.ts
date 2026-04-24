import prisma from '@/config/database'
import { AsaasApi } from '@/providers/asaasApi'

export const createCustomer = async (
  clientId: string,
  data: {
    cpfCnpj: string
    name: string
    email: string
    phone?: string
    postalCode?: string
    address?: string
    addressNumber?: string
  }
) => {
  const existing = await prisma.asaasCustomer.findUnique({
    where: { clientId }
  })
  if (existing) throw new Error('Cliente ja cadastrado na Asaas.')

  const asaas = AsaasApi()

  const res = await asaas.post('/customers', {
    name: data.name,
    cpfCnpj: data.cpfCnpj,
    email: data.email,
    phone: data.phone,
    postalCode: data.postalCode,
    address: data.address,
    addressNumber: data.addressNumber,
    externalReference: clientId
  })

  if (![200, 201].includes(res.status)) {
    const error = await res.request.response.json().catch(() => ({}))
    throw new Error(`Erro ao cadastrar na Asaas: ${JSON.stringify(error)}`)
  }

  const customer = await res.data[0]

  return prisma.asaasCustomer.create({
    data: {
      clientId,
      asaasCustomerId: customer.id,
      cpfCnpj: data.cpfCnpj,
      name: data.name,
      email: data.email,
      phone: data.phone,
      postalCode: data.postalCode,
      address: data.address,
      addressNumber: data.addressNumber
    }
  })
}
