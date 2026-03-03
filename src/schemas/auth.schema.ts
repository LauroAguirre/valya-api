import { z } from 'zod';

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

export const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres.'),
  email: z.string().email('E-mail invalido.'),
  password: z
    .string()
    .regex(
      passwordRegex,
      'Senha deve ter pelo menos 8 caracteres, com letras maiusculas, minusculas, numeros e caracteres especiais.'
    ),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas nao conferem.',
  path: ['confirmPassword'],
});

export const loginSchema = z.object({
  email: z.string().email('E-mail invalido.'),
  password: z.string().min(1, 'Senha obrigatoria.'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('E-mail invalido.'),
});

export const verifyCodeSchema = z.object({
  email: z.string().email('E-mail invalido.'),
  code: z.string().length(6, 'Codigo deve ter 6 digitos.'),
});

export const resetPasswordSchema = z.object({
  email: z.string().email('E-mail invalido.'),
  code: z.string().length(6, 'Codigo deve ter 6 digitos.'),
  password: z
    .string()
    .regex(
      passwordRegex,
      'Senha deve ter pelo menos 8 caracteres, com letras maiusculas, minusculas, numeros e caracteres especiais.'
    ),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas nao conferem.',
  path: ['confirmPassword'],
});

export const oauthSchema = z.object({
  provider: z.enum(['GOOGLE', 'FACEBOOK']),
  accessToken: z.string().min(1, 'Token obrigatorio.'),
});
