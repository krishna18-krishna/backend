import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma';
import { HttpError } from '../middleware/errors';
import { signAccessToken } from '../middleware/auth';
import type { LoginInput } from '../validators/auth';

const refreshSecret = () => process.env.JWT_REFRESH_SECRET ?? 'development-refresh-secret-change-me';
const publicUser = (user: { id: number; name: string; email: string; role: 'ADMIN' | 'PROJECT_MANAGER' | 'DEVELOPER' }) => ({ id: user.id, name: user.name, email: user.email, role: user.role });

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
  if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) throw new HttpError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect');
  const safeUser = publicUser(user);
  const refreshToken = jwt.sign({ userId: user.id, nonce: crypto.randomUUID() }, refreshSecret(), { expiresIn: '30d' });
  await prisma.refreshToken.create({ data: { tokenHash: crypto.createHash('sha256').update(refreshToken).digest('hex'), userId: user.id, expiresAt: new Date(Date.now() + 30 * 86400000) } });
  return { accessToken: signAccessToken(safeUser), refreshToken, user: safeUser };
}

export async function refresh(token: string) {
  try {
    const payload = jwt.verify(token, refreshSecret()) as { userId: number };
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const stored = await prisma.refreshToken.findFirst({ where: { tokenHash, userId: payload.userId, revokedAt: null, expiresAt: { gt: new Date() } }, include: { user: true } });
    if (!stored) throw new Error('revoked');
    await prisma.refreshToken.update({ where: { id: stored.id }, data: { revokedAt: new Date() } });
    const safeUser = publicUser(stored.user);
    const next = jwt.sign({ userId: stored.userId, nonce: crypto.randomUUID() }, refreshSecret(), { expiresIn: '30d' });
    await prisma.refreshToken.create({ data: { tokenHash: crypto.createHash('sha256').update(next).digest('hex'), userId: stored.userId, expiresAt: new Date(Date.now() + 30 * 86400000) } });
    return { accessToken: signAccessToken(safeUser), refreshToken: next, user: safeUser };
  } catch { throw new HttpError(401, 'INVALID_REFRESH_TOKEN', 'Refresh token is invalid or expired'); }
}

export async function revoke(token: string) {
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  await prisma.refreshToken.updateMany({ where: { tokenHash }, data: { revokedAt: new Date() } });
}
