import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { prisma } from '../utils/prisma';

const router = Router();
router.use(requireAuth);
router.get('/', async (request, response, next) => { try { const data = await prisma.notification.findMany({ where: { userId: request.user!.id }, orderBy: { createdAt: 'desc' }, take: 30 }); const unread = data.filter((item) => !item.isRead).length; response.json({ success: true, data, unread }); } catch (error) { next(error); } });
router.patch('/:id/read', async (request, response, next) => { try { const data = await prisma.notification.updateMany({ where: { id: Number(request.params.id), userId: request.user!.id }, data: { isRead: true } }); response.json({ success: true, data: { updated: data.count === 1 } }); } catch (error) { next(error); } });
router.post('/read-all', async (request, response, next) => { try { await prisma.notification.updateMany({ where: { userId: request.user!.id, isRead: false }, data: { isRead: true } }); response.json({ success: true, data: null }); } catch (error) { next(error); } });
export default router;
