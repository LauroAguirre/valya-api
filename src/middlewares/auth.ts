import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
// import { verify } from 'jsonwebtoken'
import { env } from '../config/env.js'
import { errorResponse } from '../utils/helpers.js'
import { UserRole } from '@prisma/client'
import { isAfter, isBefore } from 'date-fns'
import { generateRefreshToken } from '@/services/refreshToken/generateRefreshToken.js'
import requestIp from 'request-ip'
import prisma from '@/config/database.js'

export interface JwtPayload {
  userId: string
  role: UserRole
}

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    errorResponse(res, 'Token de autenticacao nao fornecido.', 401)
    return
  }

  const token = authHeader.split(' ')[1]
  const ip = requestIp.getClientIp(req) || '-'

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload

    const userTk = await prisma.refreshKeys.findFirst({
      where: {
        userId: decoded.userId,
        ip
      },
      include: {
        user: {
          include: {
            realStateAgent: {
              include: {
                subscriptions: true
              }
            },
            companyUsers: true
          }
        }
      },
      orderBy: {
        authExpires: 'desc'
      }
    })

    if (!userTk || isAfter(new Date(userTk.authExpires), new Date())) {
      await generateRefreshToken(decoded.userId, token, ip)
    } else {
      if (
        (userTk && userTk.authToken !== token) ||
        isBefore(new Date(userTk.authExpires), new Date())
      ) {
        throw new Error('Token invalido ou expirado')
        // return res.status(420).send({ message: 'Erro de autenticação' })
      }
    }

    req.user = userTk?.user
      ? {
          ...userTk.user,
          realStateAgent: userTk.user.realStateAgent ?? undefined
        }
      : undefined

    next()
  } catch {
    errorResponse(res, 'Token invalido ou expirado.', 401)
  }
}

export function authorizeRoles(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      errorResponse(res, 'Nao autenticado.', 401)
      return
    }

    if (!roles.includes(req.user.role)) {
      errorResponse(res, 'Acesso nao autorizado.', 403)
      return
    }

    next()
  }
}
