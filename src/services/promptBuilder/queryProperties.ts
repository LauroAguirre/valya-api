import prisma from '@/config/database'
import { Prisma } from '@prisma/client'

export const queryProperties = (
  clientId: string,
  filters: Record<string, unknown>
) => {
  const where: Record<string, unknown> = { userId: clientId }

  if (filters.tipo) where.type = { contains: filters.tipo as string }
  if (filters.bairro)
    where.neighborhood = { contains: filters.bairro as string }
  if (filters.cidade) where.city = { contains: filters.cidade as string }
  if (filters.quartos) where.bedrooms = { gte: filters.quartos as number }
  if (filters.vagas) where.garageCount = { gte: filters.vagas as number }
  if (filters.finalidade) where.purpose = filters.finalidade as string

  if (filters.faixa_preco_min || filters.faixa_preco_max) {
    where.totalPrice = {}
    if (filters.faixa_preco_min)
      (where.totalPrice as Record<string, unknown>).gte =
        filters.faixa_preco_min
    if (filters.faixa_preco_max)
      (where.totalPrice as Record<string, unknown>).lte =
        filters.faixa_preco_max
  }

  return prisma.property.findMany({
    where: where as Prisma.PropertyWhereInput,
    select: {
      id: true,
      name: true,
      type: true,
      neighborhood: true,
      city: true,
      totalPrice: true,
      bedrooms: true,
      garageCount: true,
      privateArea: true,
      description: true,
      address: true,
      minDown: true,
      installments: true,
      installmentValue: true
    },
    take: 5,
    orderBy: { createdAt: 'desc' }
  })
}
