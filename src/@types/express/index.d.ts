import { JwtPayload } from '@/middleware/auth' // Ajuste o caminho

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
    }
  }
}
