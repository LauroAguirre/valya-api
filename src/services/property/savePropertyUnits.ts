import prisma from '@/config/database'
import { PropertyUnit } from '@prisma/client'

export const savePropertyUnities = async (
  clientId: string,
  propertyId: string,
  unities: PropertyUnit[]
) => {
  const property = await prisma.property.findUnique({
    where: { id: propertyId, clientId }
  })
  if (!property) throw new Error('Propriedade nao encontrada.')

  return await prisma.property.update({
    where: {
      id: propertyId
    },
    data: {
      units: {
        deleteMany: {
          NOT: {
            id: {
              in: unities.map(u => u.id)
            }
          }
        },
        createMany: {
          skipDuplicates: true,
          data: unities.map(u => ({
            ...u,
            propertyId
          }))
        },
        updateMany: unities.map(u => ({
          where: {
            id: u.id
          },
          data: {
            ...u
          }
        }))
      }
    }
  })
}
