import { Injectable } from '@nestjs/common';
import sgMail from '@sendgrid/mail';

@Injectable()
export class EmailService {
  constructor() {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
  }
  async sendTemplate(to: string, templateIdEnvKey: string, dynamicTemplateData: Record<string, any>) {
    const from = { email: process.env.SENDGRID_FROM_EMAIL!, name: process.env.SENDGRID_FROM_NAME! };
    const templateId = process.env[templateIdEnvKey]!;
    await sgMail.send({ to, from, templateId, dynamicTemplateData });
  }
}
