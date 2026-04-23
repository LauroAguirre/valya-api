import prisma from '@/config/database'

export const getMessages = async (
  clientId: string,
  leadId: string,
  params: { page?: number; limit?: number }
) => {
  try {
    const { page = 1, limit = 50 } = params
    const skip = (page - 1) * limit
    const lead = await prisma.lead.findFirst({
      where: { id: leadId, clientId }
    })
    if (!lead) throw new Error('Lead nao encontrado.')

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: { leadId },
        orderBy: { createdAt: 'asc' },
        skip,
        take: limit
      }),
      prisma.message.count({ where: { leadId } })
    ])

    return { messages, total, page, limit }
  } catch (error) {
    throw new Error(error)
  }
}
