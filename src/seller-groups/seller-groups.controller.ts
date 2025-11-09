import { Controller, Get, Post, Body, Query } from '@nestjs/common';

@Controller('seller-groups')
export class SellerGroupsController {
  @Post()
  async create(@Body() body: any) {
    // TODO: enforce RBAC sellerGroups.create
    return { id: 'dealerGroup_mock', ...body };
  }

  @Get()
  async list(@Query('limit') limit = 10, @Query('continuationToken') ct?: string) {
    // TODO: paginate from Cosmos
    return { items: [], limit: Number(limit), continuationToken: ct ?? null };
  }
}
