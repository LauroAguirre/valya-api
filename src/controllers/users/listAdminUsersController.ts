import { Request, Response } from 'express'
import { errorResponse, successResponse } from '@/utils/helpers'
import { listAdminUsers } from '@/services/user/listAdminUsers'

export const listAdminUsersController = async (req: Request, res: Response) => {
  try {
    const result = await listAdminUsers()
    return successResponse(res, result)
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Erro ao listar usuarios.'
    return errorResponse(res, message, 500)
  }
}
