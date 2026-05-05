import prisma from '@/config/database'
import { normalizeJid } from '@/utils/helpers'

export async function findConfigByInstanceName(instanceName: string) {
  return prisma.evolutionConfig.findUnique({
    where: { instanceName },
    select: { userId: true }
  })
}

export async function getLeadByJid(userId: string, jid: string) {
  const phone = normalizeJid(jid)
  return prisma.lead.findUnique({
    where: { userId_phone: { userId, phone } }
  })
}
