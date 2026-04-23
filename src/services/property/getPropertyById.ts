import prisma from '@/config/database'

export const getPropertyById = async (clientId: string, propertyId: string) => {
  const property = await prisma.property.findFirst({
    where: { id: propertyId, clientId },
    include: {
      units: { orderBy: { unitName: 'asc' } },
      images: { orderBy: { order: 'asc' } },
      adLinks: true
    }
  })
  if (!property) throw new Error('Imovel nao encontrado.')
  return property
}
