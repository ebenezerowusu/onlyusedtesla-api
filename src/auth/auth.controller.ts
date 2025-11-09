import { Body, Controller, HttpCode, Post, Req, UsePipes } from '@nestjs/common';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { SignInSchema, SignInDto } from './dto/signin.dto';
import { SignupPrivateSchema, SignupPrivateDto } from './dto/signup-private.dto';
import { SignupDealerSchema, SignupDealerDto } from './dto/signup-dealer.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('signin')
  @HttpCode(200)
  @UsePipes(new ZodValidationPipe(SignInSchema))
  async signIn(@Body() dto: SignInDto) {
    // TODO: fetch user from Cosmos by email, verify password
    const fakeUser = {
      id: 'usr_123',
      profile: { firstName: 'Jane', lastName: 'Doe', email: dto.email, phone: '+1555123' },
      roles: ['private_seller'],
      permissions: ['users.read','sellers.read'],
      market: { country: 'US', allowCountries: ['US'] },
    };
    const tokens = await this.auth.signTokens({ sub: fakeUser.id, roles: fakeUser.roles, permissions: fakeUser.permissions });
    return { ...tokens, user: fakeUser };
  }

  @Post('signup/private')
  @UsePipes(new ZodValidationPipe(SignupPrivateSchema))
  async signupPrivate(@Body() dto: SignupPrivateDto) {
    // TODO: create user in Cosmos (role private_seller), create seller (type private), send VERIFY_EMAIL
    return {
      userId: 'usr_private_mock',
      sellerId: 'seller_private_mock',
      verifyEmailSent: true,
    };
  }

  @Post('signup/dealer')
  @UsePipes(new ZodValidationPipe(SignupDealerSchema))
  async signupDealer(@Body() dto: SignupDealerDto) {
    // TODO: create user (dealer_admin); create seller (dealer) with companyName, syndicationSystem, businessSite;
    // if GroupDealer => create sellerGroup; init Stripe checkout using dto.subscriptionIds
    return {
      userId: 'usr_dealer_mock',
      sellerId: 'dealer_mock',
      sellerGroupId: dto.whoAreYouRepresenting === 'Group Dealer' ? 'dealerGroup_mock' : null,
      stripe: { checkoutUrl: 'https://stripe.example/checkout', sessionId: 'cs_test_mock' },
    };
  }

  @Post('refresh')
  @HttpCode(200)
  async refresh(@Req() _req: any) {
    // TODO: validate incoming refresh token and return new pair
    return { accessToken: 'mock', refreshToken: 'mock' };
  }

  @Post('logout')
  @HttpCode(204)
  async logout() {
    // TODO: invalidate refresh token server-side if we store it
    return;
  }
}
