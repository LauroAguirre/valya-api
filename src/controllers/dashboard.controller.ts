import { Request, Response } from 'express';
import { dashboardService } from '../services/dashboard.service.js';
import { successResponse, errorResponse } from '../utils/helpers.js';

export const dashboardController = {
  async getClientDashboard(req: Request, res: Response) {
    try {
      const result = await dashboardService.getClientDashboard(req.user!.userId);
      successResponse(res, result);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao buscar dashboard.';
      errorResponse(res, message, 500);
    }
  },

  async getAdminDashboard(_req: Request, res: Response) {
    try {
      const result = await dashboardService.getAdminDashboard();
      successResponse(res, result);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao buscar dashboard admin.';
      errorResponse(res, message, 500);
    }
  },
};
