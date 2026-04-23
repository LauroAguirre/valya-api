import { Request, Response } from 'express'
import { errorResponse, successResponse } from '@/utils/helpers'
import { getConnectionStatus } from '@/services/evolution/getConnectionStatus'

export const getConnectionStatusController = async (
  req: Request,
  res: Response
) => {
  try {
    const { clientId } = req.query
    const connection = await getConnectionStatus(clientId as string)

    successResponse(res, connection)
  } catch (error: unknown) {
    errorResponse(
      res,
      error instanceof Error ? error.message : 'Erro ao verificar conexao.'
    )
  }
}
