import { IsEmail, IsOptional, IsString, MinLength, IsArray } from 'class-validator';

export class SignUpPrivateDto {
  @IsString() firstName!: string;
  @IsString() lastName!: string;
  @IsEmail() email!: string;
  @IsString() phone!: string;
  @IsOptional() @IsString() zipCode?: string;
  @MinLength(8) password!: string;
  @MinLength(8) confirmPassword!: string;
  @IsOptional() acceptTos?: boolean;
  @IsOptional() @IsString() country?: string; // default from X-Country
}

export class SignUpDealerDto {
  @IsString() firstName!: string;
  @IsString() lastName!: string;
  @IsEmail() email!: string;
  @IsString() phone!: string;
  @IsString() address!: string;
  @MinLength(8) password!: string;
  @MinLength(8) confirmPassword!: string;
  @IsString() businessType!: string;
  @IsString() companyName!: string;
  @IsString() syndicationSystem!: string;
  @IsOptional() owner?: boolean;
  @IsArray() businessSites!: string[]; // array of site names/locations
  @IsArray() subscriptionProductIds!: string[]; // stripe product/price ids
  @IsOptional() acceptTos?: boolean;
  @IsOptional() @IsString() country?: string;
}

export class SignInDto {
  @IsEmail() email!: string;
  @MinLength(8) password!: string;
}
