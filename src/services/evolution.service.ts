import { env } from '../config/env.js';
import prisma from '../config/database.js';
import { calculateTypingDelay, sleep, normalizePhone } from '../utils/helpers.js';

const EVOLUTION_URL = env.EVOLUTION_API_URL;
const API_KEY = env.EVOLUTION_API_KEY;

function headers() {
  return { 'Content-Type': 'application/json', apikey: API_KEY };
}

export const evolutionService = {
  async createInstance(userId: string, instanceName: string) {
    const res = await fetch(`${EVOLUTION_URL}/instance/create`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({
        instanceName,
        integration: 'WHATSAPP-BAILEYS',
        qrcode: true,
        webhook: {
          url: `${env.FRONTEND_URL.replace('3000', String(env.PORT))}/api/webhooks/evolution`,
          events: ['messages.upsert', 'connection.update'],
          byEvents: false,
        },
      }),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(`Erro ao criar instancia: ${JSON.stringify(error)}`);
    }

    const data = await res.json();

    await prisma.evolutionConfig.upsert({
      where: { userId },
      create: { userId, instanceName, instanceId: data.instance?.instanceId || data.hash?.id, qrCode: data.qrcode?.base64 },
      update: { instanceName, instanceId: data.instance?.instanceId || data.hash?.id, qrCode: data.qrcode?.base64 },
    });

    return { instanceName, qrCode: data.qrcode?.base64, status: data.instance?.status };
  },

  async getQrCode(userId: string) {
    const config = await prisma.evolutionConfig.findUnique({ where: { userId } });
    if (!config) throw new Error('Instancia nao configurada.');

    const res = await fetch(`${EVOLUTION_URL}/instance/connect/${config.instanceName}`, { method: 'GET', headers: headers() });
    if (!res.ok) throw new Error('Erro ao obter QR Code.');

    const data = await res.json();
    if (data.base64) {
      await prisma.evolutionConfig.update({ where: { userId }, data: { qrCode: data.base64 } });
    }

    return { qrCode: data.base64 || config.qrCode, connected: config.connected, instanceName: config.instanceName };
  },

  async getConnectionStatus(userId: string) {
    const config = await prisma.evolutionConfig.findUnique({ where: { userId } });
    if (!config) throw new Error('Instancia nao configurada.');

    const res = await fetch(`${EVOLUTION_URL}/instance/connectionState/${config.instanceName}`, { method: 'GET', headers: headers() });
    if (!res.ok) throw new Error('Erro ao verificar status da conexao.');

    const data = await res.json();
    const connected = data.instance?.state === 'open';
    await prisma.evolutionConfig.update({ where: { userId }, data: { connected } });

    return { connected, state: data.instance?.state };
  },

  async sendMessage(instanceName: string, to: string, message: string) {
    const phone = normalizePhone(to);
    const typingDelay = calculateTypingDelay(message);

    try {
      await fetch(`${EVOLUTION_URL}/chat/presence/${instanceName}`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ number: phone, delay: typingDelay, presence: 'composing' }),
      });
    } catch { /* nao bloquear envio */ }

    await sleep(typingDelay);

    const res = await fetch(`${EVOLUTION_URL}/message/sendText/${instanceName}`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ number: phone, text: message }),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(`Erro ao enviar mensagem: ${JSON.stringify(error)}`);
    }

    return await res.json();
  },

  async findBrokerByPhone(phone: string) {
    const normalizedPhone = normalizePhone(phone);
    return prisma.evolutionConfig.findFirst({
      where: { phone: { contains: normalizedPhone.slice(-8) }, connected: true },
      include: { user: { select: { id: true, name: true, phone: true } } },
    });
  },

  async handleConnectionUpdate(instanceName: string, state: string) {
    const config = await prisma.evolutionConfig.findUnique({ where: { instanceName } });
    if (!config) return;
    const connected = state === 'open';
    await prisma.evolutionConfig.update({ where: { instanceName }, data: { connected } });
    return { instanceName, connected };
  },

  async disconnect(userId: string) {
    const config = await prisma.evolutionConfig.findUnique({ where: { userId } });
    if (!config) throw new Error('Instancia nao configurada.');

    await fetch(`${EVOLUTION_URL}/instance/logout/${config.instanceName}`, { method: 'DELETE', headers: headers() });
    await prisma.evolutionConfig.update({ where: { userId }, data: { connected: false, qrCode: null } });

    return { disconnected: true };
  },
};
