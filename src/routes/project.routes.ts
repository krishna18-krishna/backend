import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { projectSchema, projectUpdateSchema } from '../validators/projects';
import * as projects from '../services/project.service';

const router = Router(); router.use(requireAuth);
router.get('/', async (req, res, next) => { try { res.json({ success: true, data: await projects.list(req.user!) }); } catch (e) { next(e); } });
router.post('/', requireRole('ADMIN', 'PROJECT_MANAGER'), async (req, res, next) => { try { res.status(201).json({ success: true, data: await projects.create(req.user!, projectSchema.parse(req.body)) }); } catch (e) { next(e); } });
router.get('/:id', async (req, res, next) => { try { res.json({ success: true, data: await projects.get(Number(req.params.id), req.user!) }); } catch (e) { next(e); } });
router.patch('/:id', requireRole('ADMIN', 'PROJECT_MANAGER'), async (req, res, next) => { try { res.json({ success: true, data: await projects.update(Number(req.params.id), req.user!, projectUpdateSchema.parse(req.body)) }); } catch (e) { next(e); } });
router.delete('/:id', requireRole('ADMIN', 'PROJECT_MANAGER'), async (req, res, next) => { try { await projects.remove(Number(req.params.id), req.user!); res.status(204).send(); } catch (e) { next(e); } });
export default router;
