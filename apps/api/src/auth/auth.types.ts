import { Role } from '@prisma/client';

export type AccessTokenPayload = {
  sub: string;
  role: Role;
  phone: string;
};
