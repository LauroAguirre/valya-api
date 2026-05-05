import { Request, Response } from 'express'
import { errorResponse, successResponse } from '@/utils/helpers'
import { linkAgent } from '@/services/agents/linkAgent'

export const linkAgentController = async (req: Request, res: Response) => {
  try {
    const { id: companyId, agentId } = req.params

    await linkAgent(companyId, agentId)
    successResponse(res, { message: 'Corretor vinculado com sucesso.' })
  } catch (error: unknown) {
    errorResponse(
      res,
      error instanceof Error ? error.message : 'Erro ao vincular corretor.',
      500
    )
  }
}
