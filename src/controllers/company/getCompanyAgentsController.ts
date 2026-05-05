import { Request, Response } from 'express'
import { errorResponse, paginatedResponse } from '@/utils/helpers'
import { loadCompanyAgents } from '@/services/company/loadCompanyAgents'

export const getCompanyAgentsController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id: companyId } = req.params
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1

    const result = await loadCompanyAgents(companyId, page)
    paginatedResponse(res, result.agents, result.total, result.page, result.limit)
  } catch (error: unknown) {
    errorResponse(
      res,
      error instanceof Error ? error.message : 'Erro ao carregar corretores.',
      500
    )
  }
}
