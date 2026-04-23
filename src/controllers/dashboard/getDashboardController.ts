import { Request, Response } from 'express'
import { getAdminDashboard } from '@/services/dashboard/getAdminDashboard'
import { errorResponse, successResponse } from '@/utils/helpers'

export const getAdminDashboardController = async (
  req: Request,
  res: Response
) => {
  try {
    const result = await getAdminDashboard()
    return successResponse(res, result)
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Erro ao buscar dashboard.'
    return errorResponse(res, message, 500)
  }
}
