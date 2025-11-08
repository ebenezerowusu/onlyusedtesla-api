// src/config/jwks.ts
import { Injectable } from '@nestjs/common';
import { readFileSync } from 'node:fs';
import { createLocalJWKSet, importJWK, SignJWT, jwtVerify, JWTPayload, JWK } from 'jose';

type JWKSet = { keys: JWK[] };
type Keys = { private: JWK; public: JWK; allPublic: JWKSet };

function readJsonEnvOrFile(envJsonName: string, envPathName: string): any {
  const fromEnv = process.env[envJsonName];
  if (fromEnv && fromEnv.trim().length > 0) return JSON.parse(fromEnv);
  const p = process.env[envPathName];
  if (!p) throw new Error(`${envJsonName} or ${envPathName} must be set`);
  return JSON.parse(readFileSync(p, 'utf8'));
}

function assertEd25519Public(k: JWK) {
  if (k.kty !== 'OKP' || k.crv !== 'Ed25519' || !k.x) {
    throw new Error('Public JWK must be OKP/Ed25519 with "x"');
  }
}

function assertEd25519Private(k: JWK) {
  assertEd25519Public(k);
  if (!('d' in k) || !k.d) throw new Error('Private JWK must include "d"');
}

@Injectable()
export class JwtService {
  private keys: Keys;
  private jwks: ReturnType<typeof createLocalJWKSet>;
  private issuer = process.env.JWT_ISSUER!;
  private audience = process.env.JWT_AUDIENCE!;
  private accessTtl = Number(process.env.JWT_ACCESS_TTL_SEC ?? 900);
  private refreshTtl = Number(process.env.JWT_REFRESH_TTL_SEC ?? 2592000);
  private signingKid = process.env.JWT_SIGNING_KID; // optional override

  constructor() {
    const privSet = readJsonEnvOrFile('JWT_JWKS_PRIVATE_JSON', 'JWT_JWKS_PRIVATE_PATH') as JWKSet;
    const pubSet  = readJsonEnvOrFile('JWT_JWKS_PUBLIC_JSON',  'JWT_JWKS_PUBLIC_PATH')  as JWKSet;

    if (!Array.isArray(privSet.keys) || privSet.keys.length === 0) throw new Error('Private JWKS has no keys');
    if (!Array.isArray(pubSet.keys)  || pubSet.keys.length === 0)  throw new Error('Public JWKS has no keys');

    // choose signing key
    const priv = this.signingKid
      ? privSet.keys.find(k => k.kid === this.signingKid)
      : privSet.keys[0];
    if (!priv) throw new Error(`Signing key kid="${this.signingKid}" not found in private JWKS`);

    // find matching public (by kid) for metadata
    const pub = pubSet.keys.find(k => k.kid === priv.kid) ?? pubSet.keys[0];

    assertEd25519Private(priv);
    assertEd25519Public(pub);

    this.keys = { private: priv, public: pub, allPublic: pubSet };
    this.jwks = createLocalJWKSet(pubSet);

    if (!this.issuer || !this.audience) throw new Error('JWT_ISSUER and JWT_AUDIENCE are required');
  }

  async signAccess(payload: JWTPayload) {
    const key = await importJWK(this.keys.private, 'EdDSA');
    return new SignJWT(payload)
      .setProtectedHeader({ alg: 'EdDSA', kid: this.keys.private.kid })
      .setIssuer(this.issuer).setAudience(this.audience)
      .setIssuedAt().setExpirationTime(`${this.accessTtl}s`)
      .sign(key);
  }

  async signRefresh(payload: JWTPayload) {
    const key = await importJWK(this.keys.private, 'EdDSA');
    return new SignJWT({ ...payload, typ: 'refresh' })
      .setProtectedHeader({ alg: 'EdDSA', kid: this.keys.private.kid })
      .setIssuer(this.issuer).setAudience(this.audience)
      .setIssuedAt().setExpirationTime(`${this.refreshTtl}s`)
      .sign(key);
  }

  async verify(token: string) {
    const { payload } = await jwtVerify(token, this.jwks, {
      issuer: this.issuer,
      audience: this.audience,
    });
    return payload;
  }

  getPublicJWKS() { return this.keys.allPublic; }

  ping() {
    return {
      ok: true,
      issuer: this.issuer,
      audience: this.audience,
      kid: this.keys.private.kid,
      publicKeys: this.keys.allPublic.keys.length,
    };
  }
}
