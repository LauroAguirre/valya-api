import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { errorResponse } from '../utils/helpers.js';

export interface JwtPayload {
  userId: string;
  email: string;
  role: 'CLIENT' | 'ADMIN';
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    errorResponse(res, 'Token de autenticacao nao fornecido.', 401);
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.user = decoded;
    next();
  } catch {
    errorResponse(res, 'Token invalido ou expirado.', 401);
  }
}

export function authorizeRoles(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      errorResponse(res, 'Nao autenticado.', 401);
      return;
    }

    if (!roles.includes(req.user.role)) {
      errorResponse(res, 'Acesso nao autorizado.', 403);
      return;
    }

    next();
  };
}
