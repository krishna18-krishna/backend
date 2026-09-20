import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { prisma } from '../utils/prisma';

const router = Router(); router.use(requireAuth);
router.get('/recent', async (req, res, next) => { try { const user = req.user!; const where = user.role === 'ADMIN' ? {} : user.role === 'PROJECT_MANAGER' ? { project: { createdById: user.id } } : { task: { assignedDeveloperId: user.id } }; const data = await prisma.activityLog.findMany({ where, include: { user: { select: { name: true } }, task: { select: { title: true } } }, orderBy: { createdAt: 'desc' }, take: Math.min(Number(req.query.limit) || 20, 50) }); res.json({ success: true, data }); } catch (e) { next(e); } });
export default router;
