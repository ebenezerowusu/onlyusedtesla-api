import { Controller, Get, Param, Patch, Body } from '@nestjs/common';

@Controller('sellers')
export class SellersController {
  @Get('me')
  async me() {
    // TODO: fetch seller doc linked to current user
    return { id: 'seller_mock', sellerType: 'private' };
  }

  @Get(':id')
  async byId(@Param('id') id: string) {
    // TODO: RBAC check, fetch seller by id
    return { id, sellerType: 'dealer' };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    // TODO: RBAC check; update whitelisted fields
    return { id, updated: body };
  }
}
