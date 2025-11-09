import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppConfigSchema } from './config/app.config';
import type { ZodIssue } from 'zod';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SellersModule } from './sellers/sellers.module';
import { SellerGroupsModule } from './seller-groups/seller-groups.module';
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permissions.module';
import { PaymentsModule } from './payments/payments.module';
import { NotifyModule } from './notify/notify.module';
import { HealthModule } from './health/health.module';

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
    AuthModule,
    UsersModule,
    SellersModule,
    SellerGroupsModule,
    RolesModule,
    PermissionsModule,
    PaymentsModule,
    NotifyModule,
  ],
})
export class AppModule {}
