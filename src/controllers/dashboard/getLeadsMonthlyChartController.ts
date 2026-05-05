import { Request, Response } from 'express'
import { getLeadsMonthlyChart } from '@/services/dashboard/getLeadsMonthlyChart'
import { errorResponse, successResponse } from '@/utils/helpers'

export const getLeadsMonthlyChartController = async (
  req: Request,
  res: Response
) => {
  try {
    const months = Math.min(Math.max(parseInt(req.query.months as string) || 6, 1), 24)
    const result = await getLeadsMonthlyChart(req.user!.id, months)
    return successResponse(res, result)
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Erro ao buscar gráfico mensal.'
    return errorResponse(res, message, 500)
  }
}
