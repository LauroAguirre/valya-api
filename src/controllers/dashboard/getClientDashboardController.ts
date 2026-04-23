import { Request, Response } from 'express'
import { getClientDashboard } from '@/services/dashboard/getClientDashboard'
import { errorResponse, successResponse } from '@/utils/helpers'

export const getClientDashboardController = async (
  req: Request,
  res: Response
) => {
  try {
    const result = await getClientDashboard(req.user!.userId)
    return successResponse(res, result)
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Erro ao buscar dashboard.'
    return errorResponse(res, message, 500)
  }
}
