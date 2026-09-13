import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { Locale, Role } from '@prisma/client';

export class UpdateUserAdminDto {
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsEnum(Locale)
  preferredLocale?: Locale;
}

export class ListUsersQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  page?: number = 1;

  @IsOptional()
  pageSize?: number = 20;
}

export class UpdateMyLocaleDto {
  @IsEnum(Locale)
  preferredLocale!: Locale;
}
