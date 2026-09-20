import type { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import type { AuthUser, RoleName } from '../types/auth';
import { HttpError } from './errors';

const accessSecret = () => process.env.JWT_ACCESS_SECRET ?? 'development-access-secret-change-me';

export const signAccessToken = (user: AuthUser) => jwt.sign(user, accessSecret(), { expiresIn: '15m' });

export const requireAuth: RequestHandler = (request, _response, next) => {
  const token = request.headers.authorization?.replace('Bearer ', '');
  if (!token) return next(new HttpError(401, 'UNAUTHORIZED', 'Authentication required'));
  try {
    request.user = jwt.verify(token, accessSecret()) as AuthUser;
    return next();
  } catch { return next(new HttpError(401, 'UNAUTHORIZED', 'Invalid or expired access token')); }
};

export const requireRole = (...roles: RoleName[]): RequestHandler => (request, _response, next) => {
  if (!request.user || !roles.includes(request.user.role)) return next(new HttpError(403, 'FORBIDDEN', 'You do not have permission to perform this action'));
  return next();
};
