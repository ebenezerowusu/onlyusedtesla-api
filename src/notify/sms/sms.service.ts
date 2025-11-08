import { Injectable } from '@nestjs/common';
import Twilio from 'twilio';

@Injectable()
export class SmsService {
  private client = Twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!);
  private from = process.env.TWILIO_FROM_PHONE!;
  private messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID!;

  async send(to: string, body: string) {
    return this.client.messages.create({
      to,
      body,
      messagingServiceSid: this.messagingServiceSid || undefined,
      from: this.messagingServiceSid ? undefined : this.from,
    });
  }
}
