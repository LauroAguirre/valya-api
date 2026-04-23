import { createCustomer } from '@/services/asaas/createCustomer'
import { errorResponse, successResponse } from '@/utils/helpers'
import { Request, Response } from 'express'

export const createCustomerController = async (req: Request, res: Response) => {
  const { clientId } = req.body
  try {
    return successResponse(res, await createCustomer(clientId, req.body), 201)
  } catch (error: unknown) {
    return errorResponse(
      res,
      error instanceof Error
        ? error.message
        : 'Erro ao cadastrar cliente Asaas.'
    )
  }
}
