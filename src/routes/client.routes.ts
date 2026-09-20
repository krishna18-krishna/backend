import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { prisma } from '../utils/prisma';
import { clientSchema, clientUpdateSchema } from '../validators/admin';

const router = Router();
router.use(requireAuth, requireRole('ADMIN', 'PROJECT_MANAGER'));
router.get('/', async (_request, response, next) => { try { const data = await prisma.client.findMany({ include: { _count: { select: { projects: true } } }, orderBy: { name: 'asc' } }); response.json({ success: true, data }); } catch (error) { next(error); } });
router.post('/', requireRole('ADMIN'), async (request, response, next) => { try { const data = await prisma.client.create({ data: clientSchema.parse(request.body) }); response.status(201).json({ success: true, data }); } catch (error) { next(error); } });
router.patch('/:id', requireRole('ADMIN'), async (request, response, next) => { try { const data = await prisma.client.update({ where: { id: Number(request.params.id) }, data: clientUpdateSchema.parse(request.body) }); response.json({ success: true, data }); } catch (error) { next(error); } });
router.delete('/:id', requireRole('ADMIN'), async (request, response, next) => { try { await prisma.client.delete({ where: { id: Number(request.params.id) } }); response.status(204).send(); } catch (error) { next(error); } });
export default router;
