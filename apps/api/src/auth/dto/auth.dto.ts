import { IsString, Matches, Length } from 'class-validator';

export class RequestOtpDto {
  @IsString()
  @Matches(/^09\d{9}$/)
  phone!: string;
}

export class VerifyOtpDto {
  @IsString()
  @Matches(/^09\d{9}$/)
  phone!: string;

  @IsString()
  @Length(6, 6)
  @Matches(/^\d{6}$/)
  code!: string;
}
