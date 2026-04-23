import { listClients } from '@/services/user/listClients'
import { errorResponse, paginatedResponse } from '@/utils/helpers'
import { Request, Response } from 'express'

export const listClientsController = async (req: Request, res: Response) => {
  try {
    const { search, page, limit } = req.query
    const result = await listClients({
      search: search as string,
      page: page ? parseInt(page as string, 10) : 1,
      limit: limit ? parseInt(limit as string, 10) : 20
    })
    paginatedResponse(
      res,
      result.clients,
      result.total,
      result.page,
      result.limit
    )
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Erro ao listar clientes.'
    errorResponse(res, message, 500)
  }
}
