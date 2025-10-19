import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CosmosClient, Database } from '@azure/cosmos';

@Injectable()
export class CosmosProvider {
  public readonly client: CosmosClient;
  public readonly db: Database;

  constructor(private readonly config: ConfigService) {
    const endpoint = this.config.get<string>('COSMOSDB_ENDPOINT', { infer: true });
    const key = this.config.get<string>('COSMOSDB_KEY', { infer: true });
    const dbName = this.config.get<string>('DEFAULT_COSMOS_DB', { infer: true }) ?? 'OnlyUsedTesla-v2';

    if (!endpoint) throw new Error('COSMOSDB_ENDPOINT is required');
    if (!key) throw new Error('COSMOSDB_KEY is required');

    this.client = new CosmosClient({ endpoint, key });
    this.db = this.client.database(dbName);
  }

  async ping(): Promise<{ ok: boolean; containers: string[] }> {
    const { resources } = await this.db.containers.readAll().fetchAll();
    return { ok: true, containers: resources.map((c) => c.id) };
  }
}
