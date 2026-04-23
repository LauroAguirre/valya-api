import prisma from '@/config/database'

export const deleteUnit = async (
  clientId: string,
  propertyId: string,
  unitId: string
) => {
  const property = await prisma.property.findUnique({
    where: { id: propertyId, clientId },
    include: {
      units: {
        where: {
          id: unitId
        }
      }
    }
  })

  if (!property?.units.find(u => u.id === unitId))
    throw new Error('Unidade nao encontrada.')

  await prisma.propertyUnit.update({
    where: { id: unitId },
    data: { deletedAt: new Date() }
  })
  return { deleted: true }
}
