import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './health/health.module';
import { AppConfigSchema } from './config/app.config';
import type { ZodIssue } from 'zod';

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
  ],
})
export class AppModule {}

