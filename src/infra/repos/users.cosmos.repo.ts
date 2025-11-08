import { Injectable } from '@nestjs/common';
import { CosmosClient } from '@azure/cosmos';

const DB = process.env.DEFAULT_COSMOS_DB || 'OnlyUsedTesla-v2';
const CONTAINER = 'users';

@Injectable()
export class UsersCosmosRepo {
  private client = new CosmosClient({ endpoint: process.env.COSMOSDB_ENDPOINT!, key: process.env.COSMOSDB_KEY! });
  private container = this.client.database(DB).container(CONTAINER);

  async byEmail(email: string) {
    const q = `SELECT * FROM c WHERE c.profile.email = @e OFFSET 0 LIMIT 1`;
    const { resources } = await this.container.items
      .query({ query: q, parameters: [{ name: '@e', value: email.toLowerCase() }] })
      .fetchAll();
    return resources[0] ?? null;
  }

  async create(doc: any) {
    const { resource } = await this.container.items.create(doc);
    return resource;
  }

  async update(doc: any) {
    const { resource } = await this.container.item(doc.id, doc.id).replace(doc);
    return resource;
  }
}
