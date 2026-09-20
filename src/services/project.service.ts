import { prisma } from '../utils/prisma';
import { HttpError } from '../middleware/errors';
import type { AuthUser } from '../types/auth';

const accessWhere = (user: AuthUser) => user.role === 'ADMIN' ? {} : user.role === 'PROJECT_MANAGER' ? { createdById: user.id } : { tasks: { some: { assignedDeveloperId: user.id } } };
export const list = (user: AuthUser) => prisma.project.findMany({ where: accessWhere(user), include: { client: true, creator: { select: { id: true, name: true } }, _count: { select: { tasks: true } } }, orderBy: { updatedAt: 'desc' } });
export const get = async (id: number, user: AuthUser) => { const project = await prisma.project.findFirst({ where: { id, ...accessWhere(user) }, include: { client: true, tasks: { where: user.role === 'DEVELOPER' ? { assignedDeveloperId: user.id } : undefined, include: { assignedDeveloper: { select: { id: true, name: true } } } } } }); if (!project) throw new HttpError(404, 'NOT_FOUND', 'Project not found'); return project; };
export const create = (user: AuthUser, data: { name: string; description?: string; clientId: number }) => prisma.project.create({ data: { ...data, createdById: user.id } });
export const update = async (id: number, user: AuthUser, data: { name?: string; description?: string; clientId?: number }) => { await get(id, user); return prisma.project.update({ where: { id }, data }); };
export const remove = async (id: number, user: AuthUser) => { await get(id, user); await prisma.project.delete({ where: { id } }); };
