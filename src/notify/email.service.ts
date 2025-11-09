import { Injectable } from '@nestjs/common';
@Injectable()
export class EmailService {
  async send(templateKey: string, to: string, vars: Record<string, any>) {
    // TODO: SendGrid integration using locked template contracts
    return { ok: true, templateKey, to, vars };
  }
}
