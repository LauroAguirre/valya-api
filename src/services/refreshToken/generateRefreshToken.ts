import prisma from '@/config/database'
import { RefreshKeys } from '@prisma/client'
import { addMinutes } from 'date-fns'

export const generateRefreshToken = async (
  userId: string,
  token: string,
  ip: string
): Promise<RefreshKeys> => {
  const expiresIn = addMinutes(
    new Date(),
    Number(process.env.DEFAULT_EXPIRATION_TIME)
  )

  const verifyToken = await prisma.refreshKeys.findFirst({
    where: {
      userId,
      ip,
      authExpires: {
        gt: new Date()
      }
    }
  })

  if (verifyToken) {
    const newTk = await prisma.refreshKeys.update({
      where: {
        refreshId: verifyToken.refreshId
      },
      data: {
        authExpires: expiresIn,
        authToken: token,
        ip
      }
    })

    return newTk
  } else {
    const newRefresh = await prisma.refreshKeys.create({
      data: {
        userId,
        authExpires: expiresIn,
        authToken: token,
        ip
      }
    })

    return newRefresh
  }
}
