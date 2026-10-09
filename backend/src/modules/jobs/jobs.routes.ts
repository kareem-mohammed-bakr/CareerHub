import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../database/prisma.js';
import { authenticate, authorize } from '../../common/auth.middleware.js';
import { asyncHandler } from '../../common/async.js';
import { AppError } from '../../common/errors.js';
import { pageMeta, paginationSchema } from '../../common/pagination.js';

export const jobsRouter = Router();
const jobBase = z.object({ title: z.string().min(3).max(180), description: z.string().min(30), requirements: z.string().max(10000).optional(), category: z.string().min(2).max(100), location: z.string().max(120).optional(), employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE']), workplaceType: z.enum(['ONSITE', 'HYBRID', 'REMOTE']), experienceLevel: z.enum(['ENTRY', 'JUNIOR', 'MID', 'SENIOR', 'LEAD', 'EXECUTIVE']), salaryMin: z.number().int().nonnegative().optional(), salaryMax: z.number().int().nonnegative().optional(), currency: z.string().length(3).default('EGP'), status: z.enum(['DRAFT', 'PUBLISHED', 'CLOSED']).default('DRAFT'), expiresAt: z.coerce.date().optional() });
const jobInput = jobBase.refine(v => !v.salaryMin || !v.salaryMax || v.salaryMin <= v.salaryMax, { message: 'salaryMin must be no greater than salaryMax' });
async function employer(userId: string) { const company = await prisma.company.findFirst({ where: { OR: [{ ownerId: userId }, { members: { some: { userId } } }] } }); if (!company) throw new AppError(403, 'A company profile is required'); return company; }

jobsRouter.get('/categories', asyncHandler(async (_req, res) => {
  const rows = await prisma.job.findMany({
    where: { status: 'PUBLISHED' },
    select: { category: true },
    distinct: ['category'],
    orderBy: { category: 'asc' },
  });
  res.json({ data: rows.map((row) => row.category) });
}));

jobsRouter.get('/', asyncHandler(async (req, res) => { const { page, limit } = paginationSchema.parse(req.query); const q = z.string().optional().parse(req.query.q); const salaryMin = req.query.salaryMin ? z.coerce.number().nonnegative().parse(req.query.salaryMin) : undefined; const where = { status: 'PUBLISHED' as const, ...(q ? { OR: [{ title: { contains: q, mode: 'insensitive' as const } }, { description: { contains: q, mode: 'insensitive' as const } }, { requirements: { contains: q, mode: 'insensitive' as const } }, { company: { is: { name: { contains: q, mode: 'insensitive' as const } } } }] } : {}), ...(req.query.category ? { category: String(req.query.category) } : {}), ...(req.query.location ? { location: { contains: String(req.query.location), mode: 'insensitive' as const } } : {}), ...(req.query.experienceLevel ? { experienceLevel: String(req.query.experienceLevel) as never } : {}), ...(salaryMin !== undefined ? { salaryMax: { gte: salaryMin } } : {}) }; const [data, total] = await prisma.$transaction([prisma.job.findMany({ where, include: { company: { select: { name: true, slug: true, logoUrl: true } } }, orderBy: { publishedAt: 'desc' }, skip: (page - 1) * limit, take: limit }), prisma.job.count({ where })]); res.json({ data, meta: pageMeta(page, limit, total) }); }));
jobsRouter.get('/:id', asyncHandler(async (req, res) => { const job = await prisma.job.findFirst({ where: { id: String(req.params.id), status: 'PUBLISHED' }, include: { company: { select: { name: true, slug: true, description: true, logoUrl: true, website: true } } } }); if (!job) throw new AppError(404, 'Job not found'); res.json({ data: job }); }));
jobsRouter.post('/', authenticate, authorize('COMPANY'), asyncHandler(async (req, res) => { const input = jobInput.parse(req.body); const company = await employer(req.user!.id); if (input.status === 'PUBLISHED' && company.verificationStatus !== 'VERIFIED') throw new AppError(403, 'A verified company profile is required to publish jobs'); const data = await prisma.job.create({ data: { ...input, companyId: company.id, publishedAt: input.status === 'PUBLISHED' ? new Date() : undefined } }); res.status(201).json({ data }); }));
jobsRouter.patch('/:id', authenticate, authorize('COMPANY'), asyncHandler(async (req, res) => { const company = await employer(req.user!.id); const input = jobBase.partial().parse(req.body); if (input.status === 'PUBLISHED' && company.verificationStatus !== 'VERIFIED') throw new AppError(403, 'A verified company profile is required to publish jobs'); const job = await prisma.job.findFirst({ where: { id: String(req.params.id), companyId: company.id } }); if (!job) throw new AppError(404, 'Job not found'); const data = await prisma.job.update({ where: { id: job.id }, data: { ...input, publishedAt: input.status === 'PUBLISHED' && !job.publishedAt ? new Date() : undefined } }); res.json({ data }); }));
jobsRouter.delete('/:id', authenticate, authorize('COMPANY'), asyncHandler(async (req, res) => { const company = await employer(req.user!.id); const job = await prisma.job.findFirst({ where: { id: String(req.params.id), companyId: company.id } }); if (!job) throw new AppError(404, 'Job not found'); await prisma.job.delete({ where: { id: job.id } }); res.status(204).send(); }));
