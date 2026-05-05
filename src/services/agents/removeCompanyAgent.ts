import prisma from '@/config/database'

export const removeCompanyAgent = async (
  companyId: string,
  userId: string
) => {
  await prisma.constructionCompanyUsers.update({
    where: { companyId_userId: { companyId, userId } },
    data: { active: false }
  })
}
