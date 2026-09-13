import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { Locale } from '@prisma/client';

export class UpdateSettingsDto {
  @IsOptional()
  @IsEnum(Locale)
  defaultLocale?: Locale;

  @IsOptional()
  @IsString()
  @MinLength(2)
  storeName?: string;
}
