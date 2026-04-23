import { saveAiConfig } from '@/services/aiConfigs/saveAiConfig'
import { errorResponse, successResponse } from '@/utils/helpers'
import { Request, Response } from 'express'

export const saveAiConfigsController = async (req: Request, res: Response) => {
  try {
    const { userId, customPrompt, isActive } = req.body

    console.log({ userId })
    console.log(req.body)
    const configs = await saveAiConfig(userId, {
      customPrompt,
      isActive
    })
    return successResponse(res, configs)
  } catch (error: unknown) {
    return errorResponse(
      res,
      error instanceof Error ? error.message : 'Erro ao atualizar config IA.'
    )
  }
}
