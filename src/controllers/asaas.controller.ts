import { Request, Response } from 'express';
import { asaasService } from '../services/asaas.service.js';
import { successResponse, errorResponse } from '../utils/helpers.js';

export const asaasController = {
  async createCustomer(req: Request, res: Response) {
    try { successResponse(res, await asaasService.createCustomer(req.user!.userId, req.body), 201); }
    catch (error: unknown) { errorResponse(res, error instanceof Error ? error.message : 'Erro ao cadastrar cliente Asaas.'); }
  },

  async createSubscription(req: Request, res: Response) {
    try { successResponse(res, await asaasService.createSubscription(req.user!.userId, req.body), 201); }
    catch (error: unknown) { errorResponse(res, error instanceof Error ? error.message : 'Erro ao criar assinatura.'); }
  },
};
