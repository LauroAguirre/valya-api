import prisma from '@/config/database'

export const savePropertyImage = async (
  clientId: string,
  propertyId: string,
  images: { url: string; description?: string }[]
) => {
  const property = await prisma.property.findFirst({
    where: { id: propertyId, clientId }
  })
  if (!property) throw new Error('Imovel nao encontrado.')
  const maxOrder = await prisma.propertyImage.findFirst({
    where: { propertyId },
    orderBy: { order: 'desc' },
    select: { order: true }
  })
  let nextOrder = (maxOrder?.order ?? -1) + 1
  const created = await prisma.propertyImage.createMany({
    data: images.map(img => ({
      propertyId,
      url: img.url,
      description: img.description,
      order: nextOrder++
    }))
  })
  return { count: created.count }
}
