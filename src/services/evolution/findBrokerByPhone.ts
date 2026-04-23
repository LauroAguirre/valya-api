import prisma from '@/config/database'
import { normalizePhone } from '@/utils/helpers'

export const findBrokerByPhone = async (phone: string) => {
  const normalizedPhone = normalizePhone(phone)
  return prisma.evolutionConfig.findFirst({
    where: { phone: { contains: normalizedPhone.slice(-8) }, connected: true },
    include: { user: { select: { id: true, name: true, phone: true } } }
  })
}
