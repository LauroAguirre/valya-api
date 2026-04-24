import prisma from '@/config/database'

export const deletePropertyimage = async (userId: string, imageId: string) => {
  const image = await prisma.propertyImage.findUnique({
    where: { id: imageId },
    include: { property: true }
  })
  if (!image || image.property.userId !== userId)
    throw new Error('Imagem nao encontrada.')
  await prisma.propertyImage.delete({ where: { id: imageId } })
  return { deleted: true }
}
