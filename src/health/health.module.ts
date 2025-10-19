import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { CosmosProvider } from '../infra/cosmos.provider';
import { StorageProvider } from '../infra/storage.provider';

@Module({
  controllers: [HealthController],
  providers: [HealthService, CosmosProvider, StorageProvider],
})
export class HealthModule {}
