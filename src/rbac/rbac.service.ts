import { Injectable } from '@nestjs/common';
import { ROLE_DEFAULT_PERMS, RoleId } from './rbac.types';

@Injectable()
export class RbacService {
  flatten(user: { roles?: RoleId[]; customPermissions?: string[] }) {
    const set = new Set<string>(user.customPermissions ?? []);
    for (const r of user.roles ?? []) {
      for (const p of ROLE_DEFAULT_PERMS[r] ?? []) set.add(p);
    }
    return Array.from(set);
  }

  has(user: any, perm: string) {
    const perms = this.flatten(user);
    return perms.includes('*') || perms.includes(perm);
  }
}
