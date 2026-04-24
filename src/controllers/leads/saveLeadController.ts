import { saveLead } from '@/services/leads/createLead'
import { Request, Response } from 'express'
import { errorResponse, successResponse } from '@/utils/helpers'

export const saveLeadController = async (req: Request, res: Response) => {
  try {
    const { user } = req
    if (!user) throw new Error('Forbiden!')

    const lead = await saveLead(user.id, req.body)
    return successResponse(res, lead, 201)
  } catch (error: unknown) {
    return errorResponse(
      res,
      error instanceof Error ? error.message : 'Erro ao criar lead.'
    )
  }
}
