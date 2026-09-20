import bcrypt from 'bcryptjs';
import { PrismaClient, Priority, Role, TaskStatus, NotificationType } from '@prisma/client';

if (process.env.NODE_ENV !== 'production' && process.env.DIRECT_DATABASE_URL) {
  process.env.DATABASE_URL = process.env.DIRECT_DATABASE_URL;
}

const prisma = new PrismaClient();
async function main() {
const passwordHash = await bcrypt.hash('VelozityDemo2026!', 12);
const users = await Promise.all([
  prisma.user.upsert({ where: { email: 'admin@example.com' }, update: {}, create: { name: 'Arun Rao', email: 'admin@example.com', passwordHash, role: Role.ADMIN } }),
  prisma.user.upsert({ where: { email: 'pm1@example.com' }, update: {}, create: { name: 'Priya Shah', email: 'pm1@example.com', passwordHash, role: Role.PROJECT_MANAGER } }),
  prisma.user.upsert({ where: { email: 'pm2@example.com' }, update: {}, create: { name: 'Maya Patel', email: 'pm2@example.com', passwordHash, role: Role.PROJECT_MANAGER } }),
  ...await Promise.all(['Diego Chen', 'Ravi Kumar', 'Lena Ortiz', 'Noah Williams'].map((name, index) => prisma.user.upsert({ where: { email: `dev${index + 1}@example.com` }, update: {}, create: { name, email: `dev${index + 1}@example.com`, passwordHash, role: Role.DEVELOPER } }))),
]);
const clientNames = ['Northstar Labs', 'Atlas Retail', 'Meridian Health'];
const clients = await Promise.all(clientNames.map((name, index) => prisma.client.upsert({ where: { id: index + 1 }, update: {}, create: { name, company: name, email: `hello@${name.toLowerCase().replaceAll(' ', '')}.example` } })));
const projects = await Promise.all(clients.map((client, index) => prisma.project.upsert({ where: { id: index + 1 }, update: {}, create: { name: ['Northstar portal', 'Atlas rebrand', 'Meridian commerce'][index], description: 'Seeded agency delivery workspace', clientId: client.id, createdById: users[index % 2 + 1].id } })));
const statuses = [TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.IN_REVIEW, TaskStatus.DONE, TaskStatus.TODO];
const priorities = [Priority.HIGH, Priority.CRITICAL, Priority.MEDIUM, Priority.LOW, Priority.HIGH];
for (const [projectIndex, project] of projects.entries()) for (let taskIndex = 0; taskIndex < 5; taskIndex++) {
  const task = await prisma.task.upsert({ where: { id: projectIndex * 5 + taskIndex + 1 }, update: {}, create: { projectId: project.id, title: ['Polish onboarding flow', 'Review accessibility audit', 'Connect billing webhook', 'Prepare launch notes', 'QA responsive layouts'][taskIndex], description: 'Seeded task for the assessment workspace', assignedDeveloperId: users[3 + ((projectIndex + taskIndex) % 4)].id, status: statuses[taskIndex], priority: priorities[taskIndex], dueDate: new Date(Date.now() + (taskIndex === 1 ? -86400000 * 3 : (taskIndex + 1) * 86400000)) } });
  if (taskIndex === 1) await prisma.notification.create({ data: { userId: users[3 + ((projectIndex + taskIndex) % 4)].id, taskId: task.id, type: NotificationType.TASK_ASSIGNED, message: `${task.title} was assigned to you` } });
}
await prisma.activityLog.create({ data: { userId: users[1].id, projectId: projects[0].id, action: 'Priya created project Northstar portal' } });
await prisma.activityLog.create({ data: { userId: users[3].id, projectId: projects[1].id, taskId: 6, action: 'Diego moved Review accessibility audit', oldStatus: TaskStatus.IN_PROGRESS, newStatus: TaskStatus.IN_REVIEW } });
console.log('Seeded Velozity workspace');
}

main().catch(async (error) => { console.error(error); await prisma.$disconnect(); process.exit(1); }).finally(() => prisma.$disconnect());
