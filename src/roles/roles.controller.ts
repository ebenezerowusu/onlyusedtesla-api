import { Body, Controller, Get, Patch, Post, Query } from '@nestjs/common';

@Controller('roles')
export class RolesController {
  @Get()
  async list(@Query('limit') limit = 20, @Query('continuationToken') ct?: string) {
    return { items: [], limit: Number(limit), continuationToken: ct ?? null };
  }

  @Post()
  async create(@Body() body: { id: string; name: string; description?: string; permissions: string[] }) {
    // TODO: RBAC roles.create; insert to Cosmos
    return { ...body };
  }

  @Patch(':id')
  async update() {
    // TODO
    return { ok: true };
  }
}
