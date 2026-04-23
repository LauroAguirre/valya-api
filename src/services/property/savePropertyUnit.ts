import prisma from '@/config/database'
import { PropertyUnit } from '@prisma/client'

export const savePropertyUnit = async (
  clientId: string,
  propertyId: string,
  data: PropertyUnit
) => {
  const property = await prisma.property.findFirst({
    where: { id: propertyId, clientId }
  })
  if (!property) throw new Error('Imovel nao encontrado.')
  return prisma.propertyUnit.upsert({
    where: {
      id: data.id || ''
    },
    create: {
      ...data,
      propertyId
    },
    update: {
      ...data
    }
  })
}
