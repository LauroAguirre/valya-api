import { Request, Response } from 'express';
import { evolutionService } from '../services/evolution.service.js';
import { successResponse, errorResponse } from '../utils/helpers.js';

export const evolutionController = {
  async createInstance(req: Request, res: Response) {
    try {
      const { instanceName } = req.body;
      const result = await evolutionService.createInstance(req.user!.userId, instanceName);
      successResponse(res, result, 201);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao criar instancia.';
      errorResponse(res, message);
    }
  },

  async getQrCode(req: Request, res: Response) {
    try {
      const result = await evolutionService.getQrCode(req.user!.userId);
      successResponse(res, result);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao obter QR Code.';
      errorResponse(res, message);
    }
  },

  async getConnectionStatus(req: Request, res: Response) {
    try {
      const result = await evolutionService.getConnectionStatus(req.user!.userId);
      successResponse(res, result);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao verificar conexao.';
      errorResponse(res, message);
    }
  },

  async disconnect(req: Request, res: Response) {
    try {
      const result = await evolutionService.disconnect(req.user!.userId);
      successResponse(res, result);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao desconectar.';
      errorResponse(res, message);
    }
  },
};
