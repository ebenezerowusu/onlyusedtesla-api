import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// import Stripe from 'stripe'; // TODO: add when wiring real Stripe

@Injectable()
export class StripeService {
  constructor(private readonly cfg: ConfigService) {}
  async createDealerSubscriptionCheckout(priceIds: string[], customerEmail: string) {
    // TODO: const stripe = new Stripe(this.cfg.get('STRIPE_API_KEY')!, { apiVersion: '2024-06-20' as any });
    // TODO: create Checkout Session (mode: 'subscription') with line_items from priceIds
    return { checkoutUrl: 'https://stripe.example/checkout', sessionId: 'cs_test_mock' };
  }
}
