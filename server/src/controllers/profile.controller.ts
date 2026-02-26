import { Request, Response } from 'express';
import { profileService } from '../services/profile.service.js';
import { successResponse, errorResponse } from '../utils/helpers.js';

export const profileController = {
  async getProfile(req: Request, res: Response) {
    try {
      const result = await profileService.getProfile(req.user!.userId);
      successResponse(res, result);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao buscar perfil.';
      errorResponse(res, message);
    }
  },

  async updateProfile(req: Request, res: Response) {
    try {
      const { name, phone, personalPhone, address } = req.body;
      const result = await profileService.updateProfile(req.user!.userId, {
        name,
        phone,
        personalPhone,
        address,
      });
      successResponse(res, result);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao atualizar perfil.';
      errorResponse(res, message);
    }
  },

  async getSubscriptionStatus(req: Request, res: Response) {
    try {
      const result = await profileService.getSubscriptionStatus(req.user!.userId);
      successResponse(res, result);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao buscar assinatura.';
      errorResponse(res, message);
    }
  },
};
