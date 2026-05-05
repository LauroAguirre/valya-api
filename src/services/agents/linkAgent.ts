import prisma from '@/config/database'

export const linkAgent = async (companyId: string, userId: string) => {
  await prisma.constructionCompanyUsers.upsert({
    where: { companyId_userId: { companyId, userId } },
    update: { active: true },
    create: { companyId, userId, active: true }
  })
}
