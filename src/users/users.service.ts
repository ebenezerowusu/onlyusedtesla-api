import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { UsersCosmosRepo } from '../infra/repos/users.cosmos.repo';
import * as argon2 from 'argon2';
import { nanoid } from 'nanoid';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepo: UsersCosmosRepo) {}

  async createPrivate(input: any, countryFallback?: string) {
    if (input.password !== input.confirmPassword) throw new BadRequestException('Passwords do not match');
    const exists = await this.usersRepo.byEmail(input.email);
    if (exists) throw new ConflictException('Email already exists');

    const id = `usr_${nanoid(8)}`;
    const now = new Date().toISOString();
    const country = input.country ?? countryFallback ?? 'US';

    const doc = {
      id,
      profile: {
        email: input.email.toLowerCase(),
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone,
      },
      auth: {
        passwordHash: await argon2.hash(input.password),
        emailVerified: false,
        mfaEnabled: false,
      },
      roles: ['private_seller'],
      sellerId: null, // Stage 2 may create a private seller doc; keep null for now
      market: { country, allowedCountries: [country], source: 'user' },
      audit: { createdAt: now, updatedAt: now },
    };

    return this.usersRepo.create(doc);
  }

  async createDealer(input: any, countryFallback?: string) {
    if (input.password !== input.confirmPassword) throw new BadRequestException('Passwords do not match');
    const exists = await this.usersRepo.byEmail(input.email);
    if (exists) throw new ConflictException('Email already exists');

    const id = `usr_${nanoid(8)}`;
    const sellerId = `dealer_${nanoid(6)}`; // Stage 2: create actual seller doc in sellers container
    const now = new Date().toISOString();
    const country = input.country ?? countryFallback ?? 'US';

    const doc = {
      id,
      profile: {
        email: input.email.toLowerCase(),
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone,
        address: input.address,
      },
      auth: {
        passwordHash: await argon2.hash(input.password),
        emailVerified: false,
        mfaEnabled: false,
      },
      roles: ['dealer_admin'],
      sellerId,
      market: { country, allowedCountries: [country], source: 'user' },
      // keep references to dealer application fields for Stage 2 pipeline
      dealerSignup: {
        businessType: input.businessType,
        companyName: input.companyName,
        syndicationSystem: input.syndicationSystem,
        businessSites: input.businessSites ?? [],
        subscriptionProductIds: input.subscriptionProductIds ?? [],
      },
      audit: { createdAt: now, updatedAt: now },
    };

    return this.usersRepo.create(doc);
  }
}
