import { PrismaClient } from '@prisma/client';

if (process.env.NODE_ENV !== 'production' && process.env.DIRECT_DATABASE_URL) {
	process.env.DATABASE_URL = process.env.DIRECT_DATABASE_URL;
}

export const prisma = new PrismaClient();
