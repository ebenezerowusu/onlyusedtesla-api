export type Permission = string; // e.g. 'listings.browse'
export type RoleId = 'private_seller' | 'dealer_admin' | 'system_admin';

export const ROLE_DEFAULT_PERMS: Record<RoleId, Permission[]> = {
  private_seller: ['listings.create', 'listings.browse', 'offers.create'],
  dealer_admin: ['listings.create', 'listings.manage', 'offers.manage', 'staff.invite'],
  system_admin: ['*'],
};
