import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BlobServiceClient } from '@azure/storage-blob';

@Injectable()
export class StorageProvider {
  public readonly blob: BlobServiceClient;

  constructor(private readonly config: ConfigService) {
    const conn = this.config.get<string>('AZURE_STORAGE_CONNECTION_STRING', { infer: true });
    if (!conn) {
      throw new Error('AZURE_STORAGE_CONNECTION_STRING is required');
    }
    this.blob = BlobServiceClient.fromConnectionString(conn);
  }

  async ping(): Promise<{ ok: boolean; containers: string[] }> {
    const containers: string[] = [];
    for await (const c of this.blob.listContainers()) {
      containers.push(c.name);
    }
    return { ok: true, containers };
  }
}

