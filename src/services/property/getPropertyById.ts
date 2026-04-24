import prisma from '@/config/database'

export const getPropertyById = async (userId: string, propertyId: string) => {
  const property = await prisma.property.findFirst({
    where: { id: propertyId, userId },
    include: {
      units: { orderBy: { unitName: 'asc' } },
      images: { orderBy: { order: 'asc' } },
      adLinks: true,
      user: true
    }
  })
  if (!property) throw new Error('Imovel nao encontrado.')
  return property
}
