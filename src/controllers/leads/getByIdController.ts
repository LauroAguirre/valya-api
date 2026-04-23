import { getLeadById } from '@/services/leads/getById'
import { Request, Response } from 'express'
import { errorResponse, successResponse } from '@/utils/helpers.js'

export const getByIdController = async (req: Request, res: Response) => {
  try {
    const { clientId, leadId } = req.query
    const lead = getLeadById(clientId as string, leadId as string)

    return successResponse(res, lead)
  } catch (error: unknown) {
    return errorResponse(
      res,
      error instanceof Error ? error.message : 'Erro ao buscar lead.'
    )
  }
}
