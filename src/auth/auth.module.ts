import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '../crypto/jwt.module';
import { EmailModule } from '../notify/email/email.module';
import { UsersCosmosRepo } from '../infra/repos/users.cosmos.repo';

@Module({
  imports: [UsersModule, JwtModule, EmailModule],
  controllers: [AuthController],
  providers: [AuthService, UsersCosmosRepo],
})
export class AuthModule {}
