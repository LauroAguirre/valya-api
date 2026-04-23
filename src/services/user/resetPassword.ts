import prisma from "@/config/database";
import { generateToken, SALT_ROUNDS } from "@/utils/helpers";
import bcrypt from 'bcryptjs';

export const resetPassword = async (email: string, code: string, newPassword: string) =>{
  const client = await prisma.client.findUnique({ where: { email } });
    if (!client) throw new Error('Codigo invalido.');

    const resetRecord = await prisma.passwordReset.findFirst({
      where: { clientId: client.id, code, used: false, expiresAt: { gte: new Date() } },
      orderBy: { createdAt: 'desc' },
    });

    if (!resetRecord) throw new Error('Codigo invalido ou expirado.');

    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    await prisma.$transaction([
      prisma.client.update({ where: { id: client.id }, data: { password: hashedPassword } }),
      prisma.passwordReset.update({ where: { id: resetRecord.id }, data: { used: true } }),
    ]);

    const token = generateToken({ userId: client.id, email: client.email, role: client.role });
    return {
      user: { id: client.id, name: client.name, email: client.email, role: client.role },
      token,
    };
}