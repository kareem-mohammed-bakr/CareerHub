import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../database/prisma.js';
import { authenticate, authorize } from '../../common/auth.middleware.js';
import { asyncHandler } from '../../common/async.js';
import { AppError } from '../../common/errors.js';
import { pageMeta, paginationSchema } from '../../common/pagination.js';

export const applicationsRouter = Router();
applicationsRouter.post('/jobs/:jobId/applications', authenticate, authorize('JOB_SEEKER'), asyncHandler(async (req, res) => {
    const body = z.object({ resumeId: z.string().uuid().optional(), coverLetter: z.string().max(5000).optional() }).parse(req.body);
    const jobId = String(req.params.jobId);
    const job = await prisma.job.findFirst({ where: { id: jobId, status: 'PUBLISHED' }, include: { company: true } });
    if (!job) throw new AppError(404, 'Job not found');
    if (body.resumeId) {
        const resume = await prisma.resume.findFirst({ where: { id: body.resumeId, userId: req.user!.id } });
        if (!resume) throw new AppError(400, 'Invalid resume');
    }

    try {
        const application = await prisma.$transaction(async (tx) => {
            const item = await tx.application.create({ data: { ...body, jobId: job.id, userId: req.user!.id } });
            await tx.applicationStatusHistory.create({ data: { applicationId: item.id, status: 'SUBMITTED', changedById: req.user!.id } });
            await tx.notification.create({
                data: {
                    userId: job.company.ownerId,
                    type: 'NEW_APPLICATION',
                    title: 'New application',
                    body: `A candidate applied for ${job.title}`,
                    data: { applicationId: item.id },
                },
            });
            return item;
        });
        res.status(201).json({ data: application });
    } catch (error) {
        if ((error as { code?: string }).code === 'P2002') throw new AppError(409, 'You have already applied for this job');
        throw error;
    }
}));
applicationsRouter.get('/applications/me', authenticate, authorize('JOB_SEEKER'), asyncHandler(async (req, res) => { const { page, limit } = paginationSchema.parse(req.query); const where = { userId: req.user!.id }; const [data, total] = await prisma.$transaction([prisma.application.findMany({ where, include: { job: { include: { company: { select: { name: true, slug: true } } } } }, orderBy: { appliedAt: 'desc' }, skip: (page - 1) * limit, take: limit }), prisma.application.count({ where })]); res.json({ data, meta: pageMeta(page, limit, total) }); }));
applicationsRouter.patch('/applications/:id/status', authenticate, authorize('COMPANY', 'ADMIN'), asyncHandler(async (req, res) => {
    const body = z.object({ status: z.enum(['REVIEWING', 'SHORTLISTED', 'INTERVIEW', 'OFFER', 'REJECTED', 'HIRED']), note: z.string().max(2000).optional() }).parse(req.body); const applicationId = String(req.params.id);

    const app = await prisma.application.findUnique({
        where: {
            id: applicationId
        },
        include: {
            job: {
                include: {
                    company: {
                        include: {
                            members: true
                        }
                    }
                }
            }
        }
    }); if (!app) throw new AppError(404, 'Application not found'); const permitted = app.job.company.ownerId === req.user!.id || app.job.company.members.some(m => m.userId === req.user!.id); if (!permitted && req.user!.role !== 'ADMIN') throw new AppError(403, 'Insufficient permissions'); const data = await prisma.$transaction(async tx => { const item = await tx.application.update({ where: { id: app.id }, data: { status: body.status } }); await tx.applicationStatusHistory.create({ data: { applicationId: app.id, previousStatus: app.status, status: body.status, note: body.note, changedById: req.user!.id } }); await tx.notification.create({ data: { userId: app.userId, type: 'APPLICATION_STATUS', title: 'Application updated', body: `Your application status is now ${body.status}`, data: { applicationId: app.id } } }); return item; }); res.json({ data });
}));
