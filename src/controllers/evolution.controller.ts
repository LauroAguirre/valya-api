import { Request, Response } from 'express';
import { evolutionService } from '../services/evolution.service.js';
import { successResponse, errorResponse } from '../utils/helpers.js';

export const evolutionController = {
  async createInstance(req: Request, res: Response) {
    try { successResponse(res, await evolutionService.createInstance(req.user!.userId, req.body.instanceName), 201); }
    catch (error: unknown) { errorResponse(res, error instanceof Error ? error.message : 'Erro ao criar instancia.'); }
  },

  async getQrCode(req: Request, res: Response) {
    try { successResponse(res, await evolutionService.getQrCode(req.user!.userId)); }
    catch (error: unknown) { errorResponse(res, error instanceof Error ? error.message : 'Erro ao obter QR Code.'); }
  },

  async getConnectionStatus(req: Request, res: Response) {
    try { successResponse(res, await evolutionService.getConnectionStatus(req.user!.userId)); }
    catch (error: unknown) { errorResponse(res, error instanceof Error ? error.message : 'Erro ao verificar conexao.'); }
  },

  async disconnect(req: Request, res: Response) {
    try { successResponse(res, await evolutionService.disconnect(req.user!.userId)); }
    catch (error: unknown) { errorResponse(res, error instanceof Error ? error.message : 'Erro ao desconectar.'); }
  },
};
