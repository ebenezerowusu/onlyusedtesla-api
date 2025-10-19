// src/config/config.module.ts
import { Module } from '@nestjs/common';
import { loadConfig, AppConfig } from './app.config';

export const CONFIG = Symbol('APP_CONFIG');

@Module({
  providers: [{ provide: CONFIG, useFactory: (): AppConfig => loadConfig() }],
  exports: [CONFIG],
})
export class ConfigModule {}
