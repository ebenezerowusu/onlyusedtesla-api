import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(private readonly required: string[]) {}
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest();
    const user = req.user as { roles?: string[]; permissions?: string[] } | undefined;
    if (!user) throw new ForbiddenException('No auth context');
    const perms = new Set<string>(user.permissions ?? []);
    const ok = this.required.every(p => perms.has(p));
    if (!ok) throw new ForbiddenException('Missing permissions');
    return true;
  }
}
