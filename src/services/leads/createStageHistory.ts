import prisma from '@/config/database'
import { LeadStage } from '@prisma/client'

interface CreateStageHistoryParams {
  leadId: string
  fromStage: LeadStage | null
  toStage: LeadStage
  userId?: string | null
  changedByAi?: boolean
  obs?: string | null
}

export const createStageHistory = (params: CreateStageHistoryParams) => {
  return prisma.leadStageHistory.create({
    data: {
      leadId: params.leadId,
      fromStage: params.fromStage ?? null,
      toStage: params.toStage,
      userId: params.userId ?? null,
      changedByAi: params.changedByAi ?? false,
      obs: params.obs ?? null
    }
  })
}
