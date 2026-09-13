import { z } from 'zod';
import { LOCALES } from './locales';
import { ROLES } from './roles';

export const localeSchema = z.enum(LOCALES);
export const roleSchema = z.enum(ROLES);

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^09\d{9}$/, 'Phone must be a valid Iranian mobile number (09xxxxxxxxx)');

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
