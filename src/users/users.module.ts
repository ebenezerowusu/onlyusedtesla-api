import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersCosmosRepo } from '../infra/repos/users.cosmos.repo';

@Module({
  providers: [UsersService, UsersCosmosRepo],
  exports: [UsersService],
})
export class UsersModule {}
