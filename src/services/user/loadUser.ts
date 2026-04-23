import prisma from '@/config/database'

export const loadUser = async (userId: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        address: true,
        avatarUrl: true,
        createdAt: true,
        realStateAgent: {
          include: {
            subscriptions: {
              include: {
                plan: {
                  include: {
                    features: true
                  }
                }
              }
            }
          }
        },
        companyUsers: {
          include: {
            constructionCompany: {
              include: {
                subscription: {
                  include: {
                    plan: {
                      include: {
                        features: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    })
    if (!user) throw new Error('Usuario nao encontrado.')
    return user
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }

    throw new Error(String(error))
  }
}
