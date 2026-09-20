import type { Role, User } from '@prisma/client';

export type AuthUser = Pick<User, 'id' | 'name' | 'email' | 'role'>;

declare global {
  namespace Express {
    interface Request { user?: AuthUser }
  }
}

export type RoleName = Role;
