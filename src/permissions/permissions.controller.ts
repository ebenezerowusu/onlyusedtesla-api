import { Body, Controller, Get, Patch, Post, Query } from '@nestjs/common';

@Controller('permissions')
export class PermissionsController {
  @Get()
  async list(@Query('limit') limit = 100) {
    return { items: [], limit: Number(limit) };
  }

  @Post()
  async create(@Body() body: any) {
    // TODO: RBAC permissions.create
    return body;
  }

  @Patch(':id')
  async update() {
    // TODO
    return { ok: true };
  }
}
