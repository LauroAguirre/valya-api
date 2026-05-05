import prisma from '@/config/database'

export const deleteProperty = async (userId: string, propertyId: string) => {
  const existing = await prisma.property.findFirst({
    where: { id: propertyId, userId }
  })
  if (!existing) throw new Error('Imovel nao encontrado.')
  await prisma.property.update({
    where: { id: propertyId },
    data: { deletedAt: new Date() }
  })
  return { deleted: true }
}
