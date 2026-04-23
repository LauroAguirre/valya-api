import { Request, Response } from 'express'
import { successResponse, errorResponse } from '@/utils/helpers.js'
import { updateStage } from '@/services/leads/updateStage'

export const updateStageController = async (req: Request, res: Response) => {
  try {
    const { clientId, stage } = req.body
    const { leadId } = req.params

    const lead = await updateStage(clientId, leadId, stage)

    return successResponse(res, lead)
  } catch (error: unknown) {
    return errorResponse(
      res,
      error instanceof Error ? error.message : 'Erro ao atualizar estagio.'
    )
  }
}
