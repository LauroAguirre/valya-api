import { Request, Response } from 'express';
import { authService } from '../services/auth.service.js';
import { successResponse, errorResponse } from '../utils/helpers.js';

export const authController = {
  async register(req: Request, res: Response) {
    try {
      const { name, email, password } = req.body;
      const result = await authService.register({ name, email, password });
      successResponse(res, result, 201);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao registrar.';
      errorResponse(res, message);
    }
  },

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      successResponse(res, result);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao fazer login.';
      errorResponse(res, message, 401);
    }
  },

  async oauthLogin(req: Request, res: Response) {
    try {
      const { provider, accessToken } = req.body;
      const result = await authService.oauthLogin(provider, accessToken);
      successResponse(res, result);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro no login OAuth.';
      errorResponse(res, message, 401);
    }
  },

  async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;
      const result = await authService.forgotPassword(email);
      successResponse(res, result);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao processar solicitacao.';
      errorResponse(res, message);
    }
  },

  async verifyCode(req: Request, res: Response) {
    try {
      const { email, code } = req.body;
      const result = await authService.verifyResetCode(email, code);
      successResponse(res, result);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Codigo invalido.';
      errorResponse(res, message);
    }
  },

  async resetPassword(req: Request, res: Response) {
    try {
      const { email, code, password } = req.body;
      const result = await authService.resetPassword(email, code, password);
      successResponse(res, result);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao redefinir senha.';
      errorResponse(res, message);
    }
  },

  async getMe(req: Request, res: Response) {
    try {
      const result = await authService.getMe(req.user!.userId);
      successResponse(res, result);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao obter dados.';
      errorResponse(res, message);
    }
  },
};
