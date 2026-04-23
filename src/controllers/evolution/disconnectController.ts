import { Request, Response } from 'express'
import { errorResponse, successResponse } from '@/utils/helpers'
import { evolutionDisconnect } from '@/services/evolution/disconnect'

export const evolutionDisconnectController = async (
  req: Request,
  res: Response
) => {
  const { clientId } = req.query
  const disconnected = await evolutionDisconnect(clientId as string)
  try {
    return successResponse(res, disconnected)
  } catch (error: unknown) {
    return errorResponse(
      res,
      error instanceof Error ? error.message : 'Erro ao desconectar.'
    )
  }
}
