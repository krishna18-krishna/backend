import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { prisma } from '../utils/prisma';
import bcrypt from 'bcryptjs';
import { userSchema, userUpdateSchema } from '../validators/admin';

const router = Router();
router.use(requireAuth, requireRole('ADMIN'));
router.get('/', async (_request, response, next) => { try { const data = await prisma.user.findMany({ select: { id: true, name: true, email: true, role: true, createdAt: true }, orderBy: { name: 'asc' } }); response.json({ success: true, data }); } catch (error) { next(error); } });
router.post('/', async (request, response, next) => { try { const input = userSchema.parse(request.body); const data = await prisma.user.create({ data: { name: input.name, email: input.email.toLowerCase(), role: input.role, passwordHash: await bcrypt.hash(input.password, 12) }, select: { id: true, name: true, email: true, role: true, createdAt: true } }); response.status(201).json({ success: true, data }); } catch (error) { next(error); } });
router.patch('/:id', async (request, response, next) => { try { const input = userUpdateSchema.parse(request.body); const { password, ...profile } = input; const data = await prisma.user.update({ where: { id: Number(request.params.id) }, data: { ...profile, passwordHash: password ? await bcrypt.hash(password, 12) : undefined }, select: { id: true, name: true, email: true, role: true, createdAt: true } }); response.json({ success: true, data }); } catch (error) { next(error); } });
router.delete('/:id', async (request, response, next) => { try { if (Number(request.params.id) === request.user!.id) return response.status(400).json({ success: false, error: { code: 'INVALID_OPERATION', message: 'You cannot delete your own account' } }); await prisma.user.delete({ where: { id: Number(request.params.id) } }); response.status(204).send(); } catch (error) { next(error); } });
export default router;
