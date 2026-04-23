import { Request, Response } from 'express'
import { successResponse, errorResponse } from '@/utils/helpers.js'
import { listByStage } from '@/services/leads/listByStage'

export const listByStageController = async (req: Request, res: Response) => {
  try {
    const { clientId } = req.query
    const leads = await listByStage(clientId as string)

    return successResponse(res, leads)
  } catch (error: unknown) {
    return errorResponse(
      res,
      error instanceof Error ? error.message : 'Erro ao listar leads.',
      500
    )
  }
}
