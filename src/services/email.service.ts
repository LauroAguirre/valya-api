import nodemailer from 'nodemailer'
import ejs from 'ejs'
import path from 'path'
import { env } from '../config/env.js'

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS
  }
})

async function renderTemplate(
  templateName: string,
  data: Record<string, unknown>
): Promise<string> {
  const templatePath = path.join(
    process.cwd(),
    'src',
    'templates',
    'emails',
    `${templateName}.ejs`
  )
  return ejs.renderFile(templatePath, data)
}

export const emailService = {
  async send(to: string, subject: string, html: string) {
    await transporter.sendMail({
      from: env.SMTP_FROM,
      to,
      subject,
      html
    })
  },

  async sendPasswordResetCode(to: string, name: string, code: string) {
    const html = await renderTemplate('password-reset', {
      name,
      code,
      expiresIn: '15 minutos',
      year: new Date().getFullYear()
    })
    await this.send(to, 'Valya - Codigo de recuperacao de senha', html)
  },

  async sendWelcome(to: string, name: string) {
    const html = await renderTemplate('welcome', {
      name,
      loginUrl: `${env.FRONTEND_URL}/login`,
      trialDays: 30,
      year: new Date().getFullYear()
    })
    await this.send(to, 'Bem-vindo a Valya!', html)
  },

  async sendPaymentFailed(to: string, name: string, dueDate: string) {
    const html = await renderTemplate('payment-failed', {
      name,
      dueDate,
      supportUrl: `${env.FRONTEND_URL}/perfil`,
      year: new Date().getFullYear()
    })
    await this.send(
      to,
      'Valya - Problema com a renovacao da sua assinatura',
      html
    )
  },

  async sendPaymentConfirmed(
    to: string,
    name: string,
    amount: number,
    nextDueDate: string
  ) {
    const html = await renderTemplate('payment-confirmed', {
      name,
      amount: amount.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }),
      nextDueDate,
      year: new Date().getFullYear()
    })
    await this.send(to, 'Valya - Pagamento confirmado', html)
  },

  async sendSubscriptionExpiring(to: string, name: string, daysLeft: number) {
    const html = await renderTemplate('subscription-expiring', {
      name,
      daysLeft,
      renewUrl: `${env.FRONTEND_URL}/perfil`,
      year: new Date().getFullYear()
    })
    await this.send(
      to,
      `Valya - Sua assinatura expira em ${daysLeft} dias`,
      html
    )
  }
}
