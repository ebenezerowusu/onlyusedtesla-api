import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SignJWT, importJWK, JWTPayload, KeyLike } from 'jose';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  private privateKeyPromise: Promise<KeyLike> | null = null;

  constructor(private readonly cfg: ConfigService) {}

  // --- JWT signing (EdDSA with private key) ---
  private async getPrivateKey(): Promise<KeyLike> {
    if (!this.privateKeyPromise) {
      this.privateKeyPromise = (async () => {
        const path = this.cfg.get<string>('JWT_JWKS_PRIVATE_PATH')!;
        const jwks = JSON.parse(require('fs').readFileSync(path, 'utf8'));
        const key = jwks.keys?.find((k: any) => k.kty === 'OKP' && k.crv === 'Ed25519');
        if (!key) throw new Error('No Ed25519 key in private JWKS');
        const importedKey = await importJWK(key, 'EdDSA');
        if (!('type' in importedKey)) {
          throw new Error('Imported key is not a KeyLike');
        }
        return importedKey as KeyLike;
      })();
    }
    return this.privateKeyPromise;
  }

  async hashPassword(raw: string) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(raw, salt);
  }
  async comparePassword(raw: string, hash: string) {
    return bcrypt.compare(raw, hash);
  }

  async signTokens(payload: JWTPayload) {
    const now = Math.floor(Date.now()/1000);
    const issuer = this.cfg.get<string>('JWT_ISSUER')!;
    const audience = this.cfg.get<string>('JWT_AUDIENCE')!;
    const accessTtl = Number(this.cfg.get<number>('JWT_ACCESS_TTL_SEC') ?? 900);
    const refreshTtl = Number(this.cfg.get<number>('JWT_REFRESH_TTL_SEC') ?? 2592000);
    const pk = await this.getPrivateKey();

    const accessToken = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'EdDSA' })
      .setIssuer(issuer).setAudience(audience)
      .setIssuedAt(now).setExpirationTime(now + accessTtl)
      .sign(pk);

    const refreshToken = await new SignJWT({ sub: payload.sub, typ: 'refresh' })
      .setProtectedHeader({ alg: 'EdDSA' })
      .setIssuer(issuer).setAudience(audience)
      .setIssuedAt(now).setExpirationTime(now + refreshTtl)
      .sign(pk);

    return { accessToken, refreshToken };
  }
}

