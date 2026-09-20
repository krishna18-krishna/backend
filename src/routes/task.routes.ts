import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { statusSchema, taskSchema, taskUpdateSchema } from '../validators/tasks';
import * as tasks from '../services/task.service';
import { taskFiltersSchema } from '../validators/filters';

const router = Router(); router.use(requireAuth);
router.get('/', async (req, res, next) => { try { const filters = taskFiltersSchema.parse(req.query); res.json({ success: true, ...(await tasks.list(req.user!, filters)) }); } catch (e) { next(e); } });
router.post('/', requireRole('ADMIN', 'PROJECT_MANAGER'), async (req, res, next) => { try { res.status(201).json({ success: true, data: await tasks.create(req.user!, taskSchema.parse(req.body)) }); } catch (e) { next(e); } });
router.get('/:id', async (req, res, next) => { try { res.json({ success: true, data: await tasks.get(Number(req.params.id), req.user!) }); } catch (e) { next(e); } });
router.patch('/:id', async (req, res, next) => { try { res.json({ success: true, data: await tasks.update(Number(req.params.id), req.user!, taskUpdateSchema.parse(req.body)) }); } catch (e) { next(e); } });
router.patch('/:id/status', async (req, res, next) => { try { res.json({ success: true, data: await tasks.updateStatus(Number(req.params.id), req.user!, statusSchema.parse(req.body).status) }); } catch (e) { next(e); } });
router.delete('/:id', requireRole('ADMIN', 'PROJECT_MANAGER'), async (req, res, next) => { try { await tasks.remove(Number(req.params.id), req.user!); res.status(204).send(); } catch (e) { next(e); } });
export default router;
