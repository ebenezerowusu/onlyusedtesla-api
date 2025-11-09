import { Injectable } from '@nestjs/common';
@Injectable()
export class SmsService {
  async send(templateKey: string, to: string, vars: Record<string, any>) {
    // TODO: Twilio integration using locked SMS templates
    return { ok: true, templateKey, to, vars };
  }
}
