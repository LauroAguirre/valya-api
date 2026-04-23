import prisma from '@/config/database'
import { Property } from '@prisma/client'

export const saveProperty = async (userId: string, data: Property) => {
  // const existing = await prisma.property.findFirst({
  //   where: { id: data.id, clientId }
  // })
  // if (!existing) throw new Error('Imovel nao encontrado.')
  return prisma.property.upsert({
    where: {
      id: data.id || '',
      userId
    },
    create: {
      ...data,
      userId
    },
    update: {
      name: data.name,
      address: data.address,
      bedrooms: data.bedrooms,
      garageCount: data.garageCount,
      garageType: data.garageType,
      bathrooms: data.bathrooms,
      bbqType: data.bbqType,
      description: data.description,
      privateArea: data.privateArea,
      mode: data.mode,
      purpose: data.purpose,
      type: data.type,
      neighborhood: data.neighborhood,
      city: data.city,
      totalPrice: data.totalPrice,
      minDown: data.minDown,
      installments: data.installments,
      annualBoost: data.annualBoost,
      installmentValue: data.installmentValue,
      paymentConditions: data.paymentConditions,
      paymentOptions: data.paymentOptions
    }
  })
}
