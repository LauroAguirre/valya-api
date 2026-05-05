import prisma from '@/config/database'
import { AuthProvider, UserRole } from '@prisma/client'

export class DuplicateAgentError extends Error {
  public existingUser: { id: string; name: string; email: string }

  constructor(user: { id: string; name: string; email: string }) {
    super('Corretor já cadastrado na plataforma.')
    this.name = 'DuplicateAgentError'
    this.existingUser = user
  }
}

interface CreateAgentData {
  name: string
  phone: string
  email: string
  cpfCnpj: string
}

export const createAndLinkAgent = async (
  companyId: string,
  data: CreateAgentData
) => {
  const isCpf = data.cpfCnpj.replace(/\D/g, '').length <= 11

  const existing = await prisma.user.findFirst({
    where: {
      OR: [
        { email: data.email },
        ...(isCpf ? [{ cpf: data.cpfCnpj.replace(/\D/g, '') }] : []),
        ...(!isCpf
          ? [{ realStateAgent: { cnpj: data.cpfCnpj.replace(/\D/g, '') } }]
          : [])
      ]
    },
    select: { id: true, name: true, email: true }
  })

  if (existing) {
    throw new DuplicateAgentError(existing)
  }

  const rawDoc = data.cpfCnpj.replace(/\D/g, '')

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: UserRole.CLIENT,
      provider: AuthProvider.LOCAL,
      ...(isCpf ? { cpf: rawDoc } : {}),
      companyUsers: {
        create: { companyId, active: true }
      }
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      avatarUrl: true
    }
  })

  return user
}
