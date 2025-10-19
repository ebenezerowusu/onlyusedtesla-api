import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './public.decorator';

@Injectable()
export class CountryGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1) Bypass if route/class is marked @Public()
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    // 2) Optional global kill-switch for local dev
    if (process.env.COUNTRY_GUARD_DISABLED === 'true') return true;

    // 3) Require X-Country header on non-public routes (until Auth is wired)
    const req = context.switchToHttp().getRequest();
    const country = String(req.headers['x-country'] ?? '').trim();

    if (!country) {
      throw new ForbiddenException({
        type: 'about:blank',
        title: 'Forbidden',
        detail: 'X-Country header required',
        status: 403,
      });
    }

    // 4) Optional allowlist via env (e.g., "US,CA,GB")
    const allowed = (process.env.ALLOWED_COUNTRIES ?? '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    if (allowed.length && !allowed.includes(country)) {
      throw new ForbiddenException({
        type: 'about:blank',
        title: 'Forbidden',
        detail: `Country ${country} not allowed`,
        status: 403,
      });
    }

    return true;
  }
}

