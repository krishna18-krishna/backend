import type { Server } from 'socket.io';
import { prisma } from '../utils/prisma';

let socketServer: Server | null = null;
export const configureSocketEvents = (io: Server) => { socketServer = io; };

export type ActivityPayload = { id: number; taskId: number; projectId: number; userId: number; userName: string; action: string; oldStatus: string | null; newStatus: string | null; createdAt: Date };
export type NotificationPayload = { id: number; userId: number; taskId: number | null; type: string; message: string; isRead: boolean; createdAt: Date };

export async function publishActivity(activityId: number) {
  if (!socketServer) return;
  const activity = await prisma.activityLog.findUnique({ where: { id: activityId }, include: { user: { select: { name: true } }, task: { select: { assignedDeveloperId: true } }, project: { select: { createdById: true } } } });
  if (!activity) return;
  const payload: ActivityPayload = { id: activity.id, taskId: activity.taskId ?? 0, projectId: activity.projectId, userId: activity.userId, userName: activity.user.name, action: activity.action, oldStatus: activity.oldStatus, newStatus: activity.newStatus, createdAt: activity.createdAt };
  socketServer.to('role:admin').emit('activity:updated', payload);
  socketServer.to(`user:${activity.project.createdById}`).emit('activity:updated', payload);
  if (activity.task?.assignedDeveloperId) socketServer.to(`user:${activity.task.assignedDeveloperId}`).emit('activity:updated', payload);
}

export function publishNotification(notification: NotificationPayload) { socketServer?.to(`user:${notification.userId}`).emit('notification:new', notification); }

export async function recentActivityForSocket(user: { id: number; role: string }) {
  const where = user.role === 'ADMIN' ? {} : user.role === 'PROJECT_MANAGER' ? { project: { createdById: user.id } } : { task: { assignedDeveloperId: user.id } };
  return prisma.activityLog.findMany({ where, include: { user: { select: { name: true } }, task: { select: { title: true } } }, orderBy: { createdAt: 'desc' }, take: 20 });
}
