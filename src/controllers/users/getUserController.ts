import { Request, Response } from 'express'
import { loadUser } from '@/services/user/loadUser'
import { errorResponse, successResponse } from '@/utils/helpers'

export const getUserController = async (req: Request, res: Response) => {
  try {
    const { userId } = req.query
    const result = await loadUser(userId as string)
    return successResponse(res, result)
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Erro ao obter dados.'
    return errorResponse(res, message)
  }
}
