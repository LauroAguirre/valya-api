import { Request, Response } from 'express'
import { successResponse, errorResponse } from '@/utils/helpers.js'
import { listLeads } from '@/services/leads/listLeads'

export const listLeadsController = async (req: Request, res: Response) => {
  try {
    const { clientId } = req.query
    const leads = await listLeads(clientId as string)

    console.log({ leads })

    return successResponse(res, leads)
  } catch (error: unknown) {
    return errorResponse(
      res,
      error instanceof Error ? error.message : 'Erro ao listar leads.',
      500
    )
  }
}
