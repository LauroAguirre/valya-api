import prisma from '../config/database.js';
import { leadService } from './lead.service.js';
import { evolutionService } from './evolution.service.js';
import { promptBuilderService } from './promptBuilder.service.js';
import { normalizePhone } from '../utils/helpers.js';

export const attendanceService = {
  async processIncomingMessage(data: {
    instanceName: string; remoteJid: string; fromMe: boolean; message: string; pushName?: string;
  }) {
    const { instanceName, remoteJid, fromMe, message, pushName } = data;
    const leadPhone = normalizePhone(remoteJid.replace('@s.whatsapp.net', ''));

    const evolutionConfig = await prisma.evolutionConfig.findUnique({
      where: { instanceName },
      include: { user: { select: { id: true, name: true, phone: true } } },
    });

    if (!evolutionConfig || !evolutionConfig.user) {
      console.error(`[Attendance] Instancia nao encontrada: ${instanceName}`);
      return;
    }

    const corretorId = evolutionConfig.user.id;
    const lead = await leadService.findOrCreateByPhone(corretorId, leadPhone, pushName);
    const sender = fromMe ? 'BROKER' : 'LEAD';

    await prisma.message.create({ data: { leadId: lead.id, sender: sender as any, content: message } });

    if (sender === 'LEAD') {
      await prisma.lead.update({ where: { id: lead.id }, data: { lastReplyAt: new Date() } });
    }

    if (fromMe) return { processed: true, aiResponse: false };
    if (!lead.aiEnabled) {
      console.log(`[Attendance] IA desativada para lead ${lead.id}`);
      return { processed: true, aiResponse: false };
    }

    const aiConfig = await prisma.aiConfig.findUnique({ where: { userId: corretorId } });
    if (!aiConfig?.isActive) {
      console.log(`[Attendance] IA global desativada para corretor ${corretorId}`);
      return { processed: true, aiResponse: false };
    }

    try {
      const { mensagem } = await promptBuilderService.buildAndRespond(corretorId, lead.id);
      if (!mensagem) {
        console.error(`[Attendance] Resposta vazia do prompt builder`);
        return { processed: true, aiResponse: false };
      }

      await prisma.message.create({ data: { leadId: lead.id, sender: 'AI', content: mensagem } });
      await evolutionService.sendMessage(instanceName, leadPhone, mensagem);

      console.log(`[Attendance] Resposta IA enviada para ${leadPhone} via ${instanceName}`);
      return { processed: true, aiResponse: true, message: mensagem };
    } catch (error) {
      console.error(`[Attendance] Erro ao gerar resposta IA:`, error);
      return { processed: true, aiResponse: false, error: String(error) };
    }
  },
};
