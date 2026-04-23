import { Request, Response } from 'express'
import { getAiConfig } from '@/services/aiConfigs/getAiConfig'
import { errorResponse, successResponse } from '@/utils/helpers'

export const getAiConfigsController = async (req: Request, res: Response) => {
  try {
    const { userId } = req.query
    const config = await getAiConfig(userId as string)
    return successResponse(res, config)
  } catch (error: unknown) {
    return errorResponse(
      res,
      error instanceof Error ? error.message : 'Erro ao buscar config IA.'
    )
  }
}
