import { Module } from '@nestjs/common';
import { SellerGroupsController } from './seller-groups.controller';

@Module({ controllers: [SellerGroupsController] })
export class SellerGroupsModule {}