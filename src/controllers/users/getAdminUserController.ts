import { Request, Response } from 'express'
import { getAdminUser } from '@/services/user/getAdminUser'
import { errorResponse, successResponse } from '@/utils/helpers'

export const getAdminUserController = async (req: Request, res: Response) => {
  try {
    const result = await getAdminUser(req.params.id)
    return successResponse(res, result)
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Erro ao buscar usuario.'
    return errorResponse(res, message)
  }
}
