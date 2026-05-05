import { Request, Response } from 'express'
import { errorResponse, paginatedResponse } from '@/utils/helpers'
import { searchAgents } from '@/services/agents/searchAgents'

export const searchAgentsController = async (req: Request, res: Response) => {
  try {
    const { search, city, uf, page, limit } = req.query

    const result = await searchAgents({
      search: search as string | undefined,
      city: city as string | undefined,
      uf: uf as string | undefined,
      page: page ? parseInt(page as string, 10) : 1,
      limit: limit ? parseInt(limit as string, 10) : 20
    })

    paginatedResponse(res, result.agents, result.total, result.page, result.limit)
  } catch (error: unknown) {
    errorResponse(
      res,
      error instanceof Error ? error.message : 'Erro ao buscar corretores.',
      500
    )
  }
}
