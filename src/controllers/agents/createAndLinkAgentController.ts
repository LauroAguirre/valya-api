import { Request, Response } from 'express'
import { errorResponse, successResponse } from '@/utils/helpers'
import {
  createAndLinkAgent,
  DuplicateAgentError
} from '@/services/agents/createAndLinkAgent'

export const createAndLinkAgentController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id: companyId } = req.params
    const { name, phone, email, cpfCnpj } = req.body

    const user = await createAndLinkAgent(companyId, {
      name,
      phone,
      email,
      cpfCnpj
    })

    successResponse(res, user, 201)
  } catch (error: unknown) {
    if (error instanceof DuplicateAgentError) {
      return res.status(422).json({
        success: false,
        message: error.message,
        existingUser: error.existingUser
      })
    }

    errorResponse(
      res,
      error instanceof Error ? error.message : 'Erro ao cadastrar corretor.',
      500
    )
  }
}
