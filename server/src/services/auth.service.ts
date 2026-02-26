import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/database.js';
import { env } from '../config/env.js';
import { generateCode } from '../utils/helpers.js';
import { emailService } from './email.service.js';
import type { JwtPayload } from '../middlewares/auth.js';

const SALT_ROUNDS = 12;
const TOKEN_EXPIRY = '7d';
const TRIAL_DAYS = 30;

function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

export const authService = {
  async register(data: { name: string; email: string; password: string }) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      throw new Error('E-mail ja cadastrado.');
    }

    const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: 'CLIENT',
        provider: 'LOCAL',
        subscription: {
          create: {
            status: 'TRIAL',
            startDate: new Date(),
            expiresAt: new Date(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000),
          },
        },
        aiConfig: {
          create: {},
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return { user, token };
  },

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        role: true,
        isActive: true,
        provider: true,
      },
    });

    if (!user) {
      throw new Error('Credenciais invalidas.');
    }

    if (!user.isActive) {
      throw new Error('Conta desativada. Entre em contato com o suporte.');
    }

    if (user.provider !== 'LOCAL' || !user.password) {
      throw new Error(`Esta conta utiliza login via ${user.provider}. Use a opcao correspondente.`);
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new Error('Credenciais invalidas.');
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    };
  },

  async oauthLogin(provider: 'GOOGLE' | 'FACEBOOK', accessToken: string) {
    let profileData: { email: string; name: string; providerId: string; avatarUrl?: string };

    if (provider === 'GOOGLE') {
      const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error('Token do Google invalido.');
      const data = await res.json();
      profileData = {
        email: data.email,
        name: data.name,
        providerId: data.id,
        avatarUrl: data.picture,
      };
    } else {
      const res = await fetch(
        `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${accessToken}`
      );
      if (!res.ok) throw new Error('Token do Facebook invalido.');
      const data = await res.json();
      profileData = {
        email: data.email,
        name: data.name,
        providerId: data.id,
        avatarUrl: data.picture?.data?.url,
      };
    }

    if (!profileData.email) {
      throw new Error('Nao foi possivel obter o e-mail do provedor OAuth.');
    }

    let user = await prisma.user.findUnique({ where: { email: profileData.email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: profileData.name,
          email: profileData.email,
          provider,
          providerId: profileData.providerId,
          avatarUrl: profileData.avatarUrl,
          role: 'CLIENT',
          subscription: {
            create: {
              status: 'TRIAL',
              startDate: new Date(),
              expiresAt: new Date(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000),
            },
          },
          aiConfig: {
            create: {},
          },
        },
      });
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    };
  },

  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Nao revelar se o email existe
      return { message: 'Se o e-mail estiver cadastrado, voce recebera um codigo de verificacao.' };
    }

    const code = generateCode(6);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min

    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        code,
        expiresAt,
      },
    });

    await emailService.sendPasswordResetCode(user.email, user.name, code);

    return { message: 'Se o e-mail estiver cadastrado, voce recebera um codigo de verificacao.' };
  },

  async verifyResetCode(email: string, code: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error('Codigo invalido.');

    const resetRecord = await prisma.passwordReset.findFirst({
      where: {
        userId: user.id,
        code,
        used: false,
        expiresAt: { gte: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!resetRecord) {
      throw new Error('Codigo invalido ou expirado.');
    }

    return { valid: true };
  },

  async resetPassword(email: string, code: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error('Codigo invalido.');

    const resetRecord = await prisma.passwordReset.findFirst({
      where: {
        userId: user.id,
        code,
        used: false,
        expiresAt: { gte: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!resetRecord) {
      throw new Error('Codigo invalido ou expirado.');
    }

    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      }),
      prisma.passwordReset.update({
        where: { id: resetRecord.id },
        data: { used: true },
      }),
    ]);

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    };
  },

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        personalPhone: true,
        address: true,
        avatarUrl: true,
        createdAt: true,
        subscription: {
          select: {
            id: true,
            status: true,
            startDate: true,
            expiresAt: true,
          },
        },
      },
    });

    if (!user) throw new Error('Usuario nao encontrado.');

    return user;
  },
};
