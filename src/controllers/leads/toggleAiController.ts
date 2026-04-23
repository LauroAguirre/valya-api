import { Request, Response } from 'express'
import { successResponse, errorResponse } from '@/utils/helpers'
import { toggleAi } from '@/services/leads/toggleAi'

export const toggleAiController = async (req: Request, res: Response) => {
  try {
    const { clientId } = req.body
    const { leadId } = req.params
    const lead = await toggleAi(clientId, leadId)
    return successResponse(res, lead)
  } catch (error: unknown) {
    return errorResponse(
      res,
      error instanceof Error ? error.message : 'Erro ao alterar status IA.'
    )
  }
}
