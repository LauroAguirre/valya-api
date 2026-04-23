import jwt from 'jsonwebtoken'
import { Response } from 'express'
import { JwtPayload } from 'jsonwebtoken'
import { env } from '@/config/env'

export function successResponse(
  res: Response,
  data: unknown,
  statusCode = 200
) {
  return res.status(statusCode).send(data)
  // return res.status(statusCode).json({
  //   success: true,
  //   data
  // })
}

export function errorResponse(
  res: Response,
  message: string,
  statusCode = 400
) {
  return res.status(statusCode).json({
    success: false,
    message
  })
}

export function paginatedResponse(
  res: Response,
  data: unknown[],
  total: number,
  page: number,
  limit: number
) {
  return res.status(200).json({
    success: true,
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  })
}

export function generateCode(length = 6): string {
  const chars = '0123456789'
  let code = ''
  for (let i = 0; i < length; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function calculateTypingDelay(message: string): number {
  const charCount = message.length
  const minMs = 100
  const maxMs = 200
  const avgMs = (minMs + maxMs) / 2
  return Math.min(charCount * avgMs, 15000)
}

export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '')
}

export const SALT_ROUNDS = 12
export const TOKEN_EXPIRY = '7d'
export const TRIAL_DAYS = 15

export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: TOKEN_EXPIRY })
}
