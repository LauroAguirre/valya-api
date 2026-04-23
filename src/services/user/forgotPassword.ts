import prisma from "@/config/database";
import { generateCode } from "@/utils/helpers";
import { emailService } from "../email.service";

export const forgotPassword = async (email:string) =>{
  try {
    const client = await prisma.client.findUnique({ where: { email } });
    if (!client) {
      return { message: 'Se o e-mail estiver cadastrado, voce recebera um codigo de verificacao.' };
    }

    const code = generateCode(6);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.passwordReset.create({ data: { clientId: client.id, code, expiresAt } });
    await emailService.sendPasswordResetCode(client.email, client.name, code);

    return  { message: 'Se o e-mail estiver cadastrado, voce recebera um codigo de verificacao.' };
  } catch (error:any) {
   throw new Error(error) 
  }
}