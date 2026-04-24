import prisma from '@/config/database'
import type { SavePropertyInput } from '@/schemas/property.schema'

export const saveProperty = async (userId: string, data: SavePropertyInput) => {
  const images = data.images ?? []
  const adLinks = data.adLinks ?? []

  const scalar = {
    name: data.name,
    address: data.address ?? null,
    neighborhood: data.neighborhood ?? null,
    city: data.city ?? null,
    bedrooms: data.bedrooms ?? null,
    bathrooms: data.bathrooms ?? null,
    garageCount: data.garageCount ?? null,
    garageType: data.garageType ?? null,
    bbqType: data.bbqType ?? ('NONE' as const),
    privateArea: data.privateArea ?? null,
    description: data.description ?? null,
    purpose: data.purpose ?? null,
    type: data.type ?? null,
    mode: data.mode,
    totalPrice: data.totalPrice ?? null,
    minDown: data.minDown ?? null,
    installments: data.installments ?? null,
    annualBoost: data.annualBoost ?? null,
    installmentValue: data.installmentValue ?? null,
    paymentConditions: data.paymentConditions ?? null,
    paymentOptions: data.paymentOptions ?? null
  }

  return prisma.$transaction(async tx => {
    let propertyId: string

    if (data.id) {
      const existing = await tx.property.findFirst({
        where: { id: data.id, userId }
      })
      if (!existing) throw new Error('Imovel nao encontrado.')

      await tx.property.update({ where: { id: data.id }, data: scalar })
      propertyId = data.id

      // Images: delete removed, update existing (has id), create new (no id)
      const incomingImageIds = images.filter(i => i.id).map(i => i.id as string)
      await tx.propertyImage.deleteMany({
        where: { propertyId, id: { notIn: incomingImageIds } }
      })
      for (const img of images) {
        if (!img.url) continue
        if (img.id) {
          await tx.propertyImage.update({
            where: { id: img.id },
            data: {
              url: img.url,
              description: img.description ?? null,
              order: img.order ?? 0
            }
          })
        } else {
          await tx.propertyImage.create({
            data: {
              propertyId,
              url: img.url,
              description: img.description ?? null,
              order: img.order ?? 0
            }
          })
        }
      }

      // AdLinks: same upsert strategy
      const incomingLinkIds = adLinks.filter(l => l.id).map(l => l.id as string)
      await tx.propertyAdLink.deleteMany({
        where: { propertyId, id: { notIn: incomingLinkIds } }
      })
      for (const link of adLinks) {
        if (!link.platform) continue
        if (link.id) {
          await tx.propertyAdLink.update({
            where: { id: link.id },
            data: {
              platform: link.platform,
              adId: link.adId ?? null,
              url: link.url ?? null
            }
          })
        } else {
          await tx.propertyAdLink.create({
            data: {
              propertyId,
              platform: link.platform,
              adId: link.adId ?? null,
              url: link.url ?? null
            }
          })
        }
      }
    } else {
      const created = await tx.property.create({
        data: {
          ...scalar,
          userId,
          images: {
            create: images
              .filter(img => img.url)
              .map((img, idx) => ({
                url: img.url!,
                description: img.description ?? null,
                order: img.order ?? idx
              }))
          },
          adLinks: {
            create: adLinks
              .filter(link => link.platform)
              .map(link => ({
                platform: link.platform!,
                adId: link.adId ?? null,
                url: link.url ?? null
              }))
          }
        }
      })
      propertyId = created.id
    }

    return tx.property.findFirst({
      where: { id: propertyId },
      include: {
        images: { orderBy: { order: 'asc' } },
        adLinks: true,
        units: { orderBy: { unitName: 'asc' } },
        user: true
      }
    })
  })
}
