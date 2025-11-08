import { IsEmail, MinLength, IsString } from 'class-validator';

export class VerifyEmailDto {
  @IsString() token!: string;
}

export class ResetPasswordRequestDto {
  @IsEmail() email!: string;
}

export class ResetPasswordDto {
  @IsString() token!: string;
  @MinLength(8) newPassword!: string;
}
