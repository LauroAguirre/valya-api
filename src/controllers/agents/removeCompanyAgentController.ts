import { Request, Response } from 'express'
import { errorResponse, successResponse } from '@/utils/helpers'
import { removeCompanyAgent } from '@/services/agents/removeCompanyAgent'

export const removeCompanyAgentController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id: userId } = req.params
    const { companyId } = req.query

    if (!companyId) {
      return errorResponse(res, 'companyId é obrigatório.', 400)
    }

    await removeCompanyAgent(companyId as string, userId)
    successResponse(res, { message: 'Corretor removido com sucesso.' })
  } catch (error: unknown) {
    errorResponse(
      res,
      error instanceof Error ? error.message : 'Erro ao remover corretor.',
      500
    )
  }
}
