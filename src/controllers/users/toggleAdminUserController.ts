import { Request, Response } from 'express'
import { toggleAdminUser } from '@/services/user/toggleAdminUser'
import { errorResponse, successResponse } from '@/utils/helpers'

export const toggleAdminUserController = async (
  req: Request,
  res: Response
) => {
  try {
    const result = await toggleAdminUser(req.params.id)
    return successResponse(res, result)
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Erro ao atualizar usuario.'
    return errorResponse(res, message)
  }
}
