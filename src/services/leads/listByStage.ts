import prisma from '@/config/database'

export const listByStage = async (userId: string) => {
  const leads = await prisma.lead.findMany({
    where: { userId },
    include: {
      properties: {
        include: { property: { select: { id: true, name: true } } },
        take: 1,
        orderBy: { createdAt: 'desc' }
      }
    },
    orderBy: { updatedAt: 'desc' }
  })

  const stages: Record<string, typeof leads> = {
    QUALIFICACAO: [],
    CADENCIA: [],
    VISITA: [],
    PROPOSTA: [],
    CONTRATO: [],
    GANHO: [],
    PERDA: []
  }

  for (const lead of leads) {
    if (stages[lead.stage]) stages[lead.stage].push(lead)
  }

  return stages
}
