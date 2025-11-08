import { Body, Controller, Headers, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpPrivateDto, SignUpDealerDto, SignInDto } from '../users/users.dto';
import { VerifyEmailDto, ResetPasswordDto, ResetPasswordRequestDto } from './auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('signup/private')
  signUpPrivate(@Body() dto: SignUpPrivateDto, @Headers('x-country') country?: string) {
    return this.auth.signUpPrivate(dto, country);
  }

  @Post('signup/dealer')
  signUpDealer(@Body() dto: SignUpDealerDto, @Headers('x-country') country?: string) {
    return this.auth.signUpDealer(dto, country);
  }

  @Post('signin')
  signIn(@Body() dto: SignInDto) {
    return this.auth.signIn(dto.email, dto.password);
  }

  @Post('verify-email')
  verifyEmail(_dto: VerifyEmailDto) {
    // Stage 1: stub response; Stage 2 implement token store + update auth.emailVerified
    return { ok: true };
  }

  @Post('reset-password/request')
  resetPasswordRequest(@Body() dto: ResetPasswordRequestDto) {
    // Stage 1: stub send email with reset link
    return { ok: true, email: dto.email };
  }

  @Post('reset-password/confirm')
  resetPassword(@Body() _dto: ResetPasswordDto) {
    // Stage 1: stub; Stage 2 verify token + update hash
    return { ok: true };
  }
}
