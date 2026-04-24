import prisma from '@/config/database'
import { generateToken } from '@/utils/helpers'
// import { generateToken, TRIAL_DAYS } from '@/utils/helpers'

export const oauthLogin = async (
  provider: 'GOOGLE' | 'FACEBOOK',
  accessToken: string
) => {
  let profileData: {
    email: string
    name: string
    providerId: string
    avatarUrl?: string
  }

  if (provider === 'GOOGLE') {
    const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
    if (!res.ok) throw new Error('Token do Google invalido.')
    const data = await res.json()
    profileData = {
      email: data.email,
      name: data.name,
      providerId: data.id,
      avatarUrl: data.picture
    }
  } else {
    const res = await fetch(
      `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${accessToken}`
    )
    if (!res.ok) throw new Error('Token do Facebook invalido.')
    const data = await res.json()
    profileData = {
      email: data.email,
      name: data.name,
      providerId: data.id,
      avatarUrl: data.picture?.data?.url
    }
  }

  if (!profileData.email)
    throw new Error('Nao foi possivel obter o e-mail do provedor OAuth.')

  let user = await prisma.user.findUnique({
    where: { email: profileData.email }
  })

  if (!user) {
    user = await prisma.user.create({
      data: {
        name: profileData.name,
        email: profileData.email,
        provider,
        providerId: profileData.providerId,
        avatarUrl: profileData.avatarUrl,
        role: 'CLIENT',
        // subscription: {
        //   create: {
        //     status: 'TRIAL',
        //     startDate: new Date(),
        //     expiresAt: new Date(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000)
        //   }
        // },
        aiConfig: { create: {} }
      }
    })
  }

  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role
  })
  return {
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    token
  }
}
