import { Request, Response } from 'express'
import { errorResponse, successResponse } from '@/utils/helpers'
import { getConnectionStatus } from '@/services/evolution/getConnectionStatus'

export const getConnectionStatusController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user!.id
    console.log('getConnectionStatusController....')
    const config = await getConnectionStatus(userId)
    console.log({ config })
    successResponse(res, config)
  } catch (error: unknown) {
    errorResponse(
      res,
      error instanceof Error ? error.message : 'Erro ao verificar conexao.'
    )
  }
}
