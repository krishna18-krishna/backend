import { Router } from 'express';
import { loginSchema } from '../validators/auth';
import * as auth from '../services/auth.service';
import { requireAuth } from '../middleware/auth';
import { HttpError } from '../middleware/errors';

const router = Router();
const cookieOptions = () => ({ httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: process.env.NODE_ENV === 'production' ? 'none' as const : 'lax' as const, maxAge: 30 * 86400000 });
router.post('/login', async (request, response, next) => { try { const result = await auth.login(loginSchema.parse(request.body)); response.cookie('refreshToken', result.refreshToken, cookieOptions()); response.json({ success: true, data: { accessToken: result.accessToken, user: result.user } }); } catch (error) { next(error); } });
router.post('/refresh', async (request, response, next) => { try { const token = request.cookies.refreshToken; if (!token) throw new HttpError(401, 'INVALID_REFRESH_TOKEN', 'Refresh token is missing'); const result = await auth.refresh(token); response.cookie('refreshToken', result.refreshToken, cookieOptions()); response.json({ success: true, data: { accessToken: result.accessToken, user: result.user } }); } catch (error) { next(error); } });
router.post('/logout', async (request, response, next) => { try { if (request.cookies.refreshToken) await auth.revoke(request.cookies.refreshToken); response.clearCookie('refreshToken'); response.json({ success: true, data: null }); } catch (error) { next(error); } });
router.get('/me', requireAuth, async (request, response, next) => { try { response.json({ success: true, data: request.user }); } catch (error) { next(error); } });
export default router;
