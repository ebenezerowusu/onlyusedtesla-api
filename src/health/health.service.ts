import { Injectable } from '@nestjs/common';
import { CosmosProvider } from '../infra/cosmos.provider';
import { StorageProvider } from '../infra/storage.provider';

@Injectable()
export class HealthService {
  constructor(
    private readonly cosmosProvider: CosmosProvider,
    private readonly storageProvider: StorageProvider,
  ) {}

  liveness() {
    return {
      name: 'onlyusedtesla-api',
      status: 'ok',
      time: new Date().toISOString(),
      uptimeSec: Number(process.uptime().toFixed(2)),
      version: process.env.npm_package_version ?? '0.0.0',
    };
  }

  // Ping Cosmos via provider
  async cosmos() {
    const t0 = Date.now();
    const res = await this.cosmosProvider.ping();
    return {
      ok: res.ok,
      database: this.cosmosProvider.db.id,
      containers: res.containers,
      latencyMs: Date.now() - t0,
    };
  }

  // Ping Azure Storage via provider
  async storage() {
    const t0 = Date.now();
    const res = await this.storageProvider.ping();
    return {
      ok: res.ok,
      account: this.storageProvider.blob.accountName,
      containers: res.containers,
      latencyMs: Date.now() - t0,
    };
  }
}

