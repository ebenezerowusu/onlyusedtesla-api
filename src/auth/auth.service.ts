import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { UsersCosmosRepo } from '../infra/repos/users.cosmos.repo';
import { JwtService } from '../crypto/jwt.service';
import * as argon2 from 'argon2';
import { nanoid } from 'nanoid';
import { EmailService } from '../notify/email/email.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly usersRepo: UsersCosmosRepo,
    private readonly jwt: JwtService,
    private readonly email: EmailService,
  ) {}

  // signup
  signUpPrivate(input: any, country?: string) {
    return this.users.createPrivate(input, country);
  }

  signUpDealer(input: any, country?: string) {
    return this.users.createDealer(input, country);
  }

  // sign in
  async signIn(email: string, password: string) {
    const user = await this.usersRepo.byEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const ok = await argon2.verify(user.auth.passwordHash, password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const sub = user.id;
    const roles = user.roles ?? [];
    const country = user.market?.country ?? 'US';

    const access = await this.jwt.signAccess({ sub, roles, country });
    const refresh = await this.jwt.signRefresh({ sub, roles, country });
    return { access, refresh, user: { id: user.id, email: user.profile.email, roles } };
  }

  // email verify (token format up to you, here just a stubbed opaque value)
  async sendVerifyEmail(user: any) {
    const token = `ver_${nanoid(24)}`;
    // store token on user for lookup (skipped: add a real verification store or field)
    await this.email.sendTemplate(user.profile.email, 'SENDGRID_TMPL_VERIFY_EMAIL', {
      firstName: user.profile.firstName ?? 'there',
      verifyUrl: `${process.env.APP_URL}/verify-email?token=${token}`,
    });
    return { sent: true };
  }
}
