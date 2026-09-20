import 'dotenv';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import authRoutes from './routes/auth.routes';
import projectRoutes from './routes/project.routes';
import taskRoutes from './routes/task.routes';
import activityRoutes from './routes/activity.routes';
import notificationRoutes from './routes/notification.routes';
import clientRoutes from './routes/client.routes';
import userRoutes from './routes/user.routes';
import dashboardRoutes from './routes/dashboard.routes';
import { errorHandler, notFound } from './middleware/errors';
import { startOverdueTasksJob } from './jobs/overdueTasks.job';
import { configureSocketEvents, recentActivityForSocket } from './websocket/events';

const app = express();
const httpServer = createServer(app);
const clientUrl = process.env.CLIENT_URL ?? 'http://localhost:5173';

app.use(cors({ origin: clientUrl, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.get('/api/health', (_request, response) => response.json({ success: true, data: { status: 'ok' } }));
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);

const io = new Server(httpServer, { cors: { origin: clientUrl, credentials: true } });
configureSocketEvents(io);
const onlineUsers = new Set<number>();
io.use((socket, next) => {
  try { const token = socket.handshake.auth.token as string; const user = jwt.verify(token, process.env.JWT_ACCESS_SECRET ?? 'development-access-secret-change-me') as { id: number; role: string }; socket.data.user = user; next(); } catch { next(new Error('Unauthorized socket')); }
});
io.on('connection', (socket) => {
  const user = socket.data.user as { id: number; role: string };
  onlineUsers.add(user.id); socket.join(`user:${user.id}`); if (user.role === 'ADMIN') socket.join('role:admin');
  io.emit('presence:updated', { onlineCount: onlineUsers.size });
  recentActivityForSocket(user).then((events) => socket.emit('activity:catchup', events)).catch(() => socket.emit('activity:catchup', []));
  socket.on('activity:catchup', async () => { socket.emit('activity:catchup', await recentActivityForSocket(user)); });
  socket.on('disconnect', () => { onlineUsers.delete(user.id); io.emit('presence:updated', { onlineCount: onlineUsers.size }); });
});

app.use(notFound);
app.use(errorHandler);
startOverdueTasksJob();

const port = Number(process.env.PORT ?? 5000);
httpServer.listen(port, () => console.log(`API listening on port ${port}`));

export { app, io };
