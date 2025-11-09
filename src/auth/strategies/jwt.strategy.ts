import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createRemoteJWKSet, jwtVerify } from 'jose';

@Injectable()
export class JwtStrategy {
  private readonly jwks: ReturnType<typeof createRemoteJWKSet> | null = null; // optional if hosting JWKS
  constructor(private readonly cfg: ConfigService) {}

  async verify(token: string) {
    // For now: skip remote JWKS; assume we’ll verify using local public key soon.
    const issuer = this.cfg.get<string>('JWT_ISSUER');
    const audience = this.cfg.get<string>('JWT_AUDIENCE');
    try {
      const { payload } = await jwtVerify(token, async () => {
        // TODO: load public key from file (cfg.JWT_JWKS_PUBLIC_PATH) with jose importJWK
        throw new Error('Public key loader not wired yet');
      }, { issuer, audience });
      return payload;
    } catch {
      return null;
    }
  }
}
