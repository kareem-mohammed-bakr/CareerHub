import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../database/prisma.js';
import { authenticate, authorize } from '../../common/auth.middleware.js';
import { asyncHandler } from '../../common/async.js';
import { AppError } from '../../common/errors.js';

export const companiesRouter = Router();
const companyInput = z.object({ name: z.string().min(2).max(150), slug: z.string().regex(/^[a-z0-9-]+$/).max(170), description: z.string().max(10000).optional(), website: z.string().url().optional(), industry: z.string().max(100).optional(), size: z.string().max(50).optional(), location: z.string().max(120).optional(), logoUrl: z.string().url().optional() });
companiesRouter.get('/slug/:slug', asyncHandler(async (req, res) => {
    const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;

    const data = await prisma.company.findUnique({
        where: { slug },
        include: {
            jobs: {
                where: { status: 'PUBLISHED' },
                orderBy: { publishedAt: 'desc' }
            }
        }
    });

    if (!data) throw new AppError(404, 'Company not found');
    res.json({ data });
}));
companiesRouter.get('/me', authenticate, authorize('COMPANY'), asyncHandler(async (req, res) => { const data = await prisma.company.findFirst({ where: { OR: [{ ownerId: req.user!.id }, { members: { some: { userId: req.user!.id } } }] }, include: { members: { include: { user: { select: { id: true, email: true, role: true } } } } } }); res.json({ data }); }));
companiesRouter.post('/', authenticate, authorize('COMPANY'), asyncHandler(async (req, res) => { const input = companyInput.parse(req.body); const existing = await prisma.company.findFirst({ where: { ownerId: req.user!.id } }); if (existing) throw new AppError(409, 'You already own a company'); const data = await prisma.company.create({ data: { ...input, ownerId: req.user!.id, members: { create: { userId: req.user!.id, memberRole: 'OWNER' } } } }); res.status(201).json({ data }); }));
companiesRouter.patch('/me', authenticate, authorize('COMPANY'), asyncHandler(async (req, res) => { const input = companyInput.partial().parse(req.body); const company = await prisma.company.findFirst({ where: { ownerId: req.user!.id } }); if (!company) throw new AppError(404, 'Company not found'); const data = await prisma.company.update({ where: { id: company.id }, data: input }); res.json({ data }); }));
