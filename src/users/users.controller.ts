import { Controller, Get, Patch, Body } from '@nestjs/common';

@Controller('users')
export class UsersController {
  @Get('me')
  async me() {
    // TODO: return current user (from req.user.sub)
    return { id: 'usr_mock', profile: { firstName: 'Jane', lastName: 'Doe' }, roles: ['private_seller'] };
  }

  @Patch('me')
  async updateMe(@Body() body: any) {
    // TODO: update allowed fields (phone, zip, marketing prefs)
    return { ok: true, updated: body };
  }
}
