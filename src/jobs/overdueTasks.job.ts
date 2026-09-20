import cron from 'node-cron';
import { prisma } from '../utils/prisma';

export const startOverdueTasksJob = () => cron.schedule('*/15 * * * *', async () => { const now = new Date(); await prisma.$transaction([prisma.task.updateMany({ where: { dueDate: { lt: now }, status: { not: 'DONE' }, isOverdue: false }, data: { isOverdue: true } }), prisma.task.updateMany({ where: { OR: [{ dueDate: { gte: now } }, { status: 'DONE' }], isOverdue: true }, data: { isOverdue: false } })]); });
