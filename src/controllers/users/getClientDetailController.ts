import { getClientDetail } from '@/services/user/getClientDetail'

import { errorResponse, successResponse } from '@/utils/helpers'
import { Request, Response } from 'express'

export const getClientDetailController = async (
  req: Request,
  res: Response
) => {
  try {
    const result = await getClientDetail(req.params.id)
    return successResponse(res, result)
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Erro ao buscar cliente.'
    return errorResponse(res, message)
  }
}
