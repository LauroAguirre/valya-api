import { Request, Response } from 'express'

import { errorResponse, successResponse } from '@/utils/helpers'
import { createSubscription } from '@/services/asaas/createSubscription'

export const createSubscriptionController = async (
  req: Request,
  res: Response
) => {
  try {
    return successResponse(
      res,
      await createSubscription(req.user!.userId, req.body),
      201
    )
  } catch (error: unknown) {
    return errorResponse(
      res,
      error instanceof Error ? error.message : 'Erro ao criar assinatura.'
    )
  }
}
