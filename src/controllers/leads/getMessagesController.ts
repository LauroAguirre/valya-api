import { getMessages } from '@/services/leads/getMessages'
import { Request, Response } from 'express'
import { errorResponse, paginatedResponse } from '@/utils/helpers'

export const getMessagesController = async (req: Request, res: Response) => {
  try {
    const { page, limit, clientId } = req.query
    const { leadId } = req.params

    const result = await getMessages(clientId as string, leadId as string, {
      page: page ? parseInt(page as string, 10) : 1,
      limit: limit ? parseInt(limit as string, 10) : 50
    })
    paginatedResponse(
      res,
      result.messages,
      result.total,
      result.page,
      result.limit
    )
  } catch (error: unknown) {
    errorResponse(
      res,
      error instanceof Error ? error.message : 'Erro ao buscar mensagens.',
      500
    )
  }
}
