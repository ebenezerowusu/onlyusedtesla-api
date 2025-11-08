import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './health/health.module';
import { AppConfigSchema } from './config/app.config';
import type { ZodIssue } from 'zod';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RbacModule } from './rbac/rbac.module';
import { EmailModule } from './notify/email/email.module';
import { SmsModule } from './notify/sms/sms.module';
import { JwtModule } from './crypto/jwt.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
      expandVariables: true,
      cache: true,
      validate: (raw: Record<string, unknown>) => {
        const parsed = AppConfigSchema.safeParse(raw);
        if (!parsed.success) {
          const msg = parsed.error.issues
            .map((i: ZodIssue) => `${i.path.join('.')} ${i.message}`)
            .join('; ');
          throw new Error(`Invalid configuration: ${msg}`);
        }
        return parsed.data;
      },
    }),
    HealthModule,
    JwtModule,
    EmailModule,
    SmsModule,
    UsersModule,
    RbacModule,
    AuthModule,
  ],
})
export class AppModule {}

