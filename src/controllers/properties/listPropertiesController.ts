import { listProperties } from '@/services/property/listProperties'
import { errorResponse, paginatedResponse } from '@/utils/helpers'
import { Request, Response } from 'express'

export const listPropertiesController = async (req: Request, res: Response) => {
  try {
    const { page, limit, search } = req.query

    const { user } = req

    const result = await listProperties(user.id, {
      page: page ? parseInt(page as string, 10) : 1,
      limit: limit ? parseInt(limit as string, 10) : 20,
      search: search as string
    })
    paginatedResponse(
      res,
      result.properties,
      result.total,
      result.page,
      result.limit
    )
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Erro ao listar imoveis.'
    errorResponse(res, message, 500)
  }
}
