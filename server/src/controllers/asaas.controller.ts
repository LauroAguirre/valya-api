import { Request, Response } from 'express';
import { asaasService } from '../services/asaas.service.js';
import { successResponse, errorResponse } from '../utils/helpers.js';

export const asaasController = {
  async createCustomer(req: Request, res: Response) {
    try {
      const result = await asaasService.createCustomer(req.user!.userId, req.body);
      successResponse(res, result, 201);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao cadastrar cliente Asaas.';
      errorResponse(res, message);
    }
  },

  async createSubscription(req: Request, res: Response) {
    try {
      const result = await asaasService.createSubscription(req.user!.userId, req.body);
      successResponse(res, result, 201);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao criar assinatura.';
      errorResponse(res, message);
    }
  },
};
