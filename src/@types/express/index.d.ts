import type { RealStateAgent, User } from '@prisma/client'

declare global {
  namespace Express {
    interface Request {
      user?: User & {
        realStateAgent?: RealStateAgent & {
          subscriptions: Subscription[]
        }
        companyUsers?: CompanyUser[]
      }
    }
  }
}
