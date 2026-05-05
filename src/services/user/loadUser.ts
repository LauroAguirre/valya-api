import prisma from '@/config/database'

export const loadUser = async (userId: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
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

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user

    return userWithoutPassword
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }

    throw new Error(String(error))
  }
}
