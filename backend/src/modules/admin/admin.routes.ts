import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../database/prisma.js';
import { authenticate, authorize } from '../../common/auth.middleware.js';
import { asyncHandler } from '../../common/async.js';
import { pageMeta, paginationSchema } from '../../common/pagination.js';

export const adminRouter=Router();
adminRouter.use(authenticate,authorize('ADMIN'));
adminRouter.get('/dashboard',asyncHandler(async(_req,res)=>{const [users,companies,jobs,applications]=await Promise.all([prisma.user.count(),prisma.company.count(),prisma.job.count(),prisma.application.count()]);res.json({data:{users,companies,jobs,applications}});}));
adminRouter.get('/users',asyncHandler(async(req,res)=>{const {page,limit}=paginationSchema.parse(req.query);const where=req.query.role?{role:String(req.query.role) as never}:{};const [data,total]=await prisma.$transaction([prisma.user.findMany({where,select:{id:true,email:true,role:true,status:true,createdAt:true},skip:(page-1)*limit,take:limit,orderBy:{createdAt:'desc'}}),prisma.user.count({where})]);res.json({data,meta:pageMeta(page,limit,total)});}));
adminRouter.patch('/users/:id/status',asyncHandler(async(req,res)=>{const body=z.object({status:z.enum(['ACTIVE','BANNED','PENDING_VERIFICATION'])}).parse(req.body);const data=await prisma.user.update({where:{id:String(req.params.id)},data:body,select:{id:true,email:true,role:true,status:true}});res.json({data});}));
adminRouter.get('/companies',asyncHandler(async(_req,res)=>{const data=await prisma.company.findMany({include:{owner:{select:{email:true}},_count:{select:{jobs:true}}},orderBy:{createdAt:'desc'}});res.json({data});}));
adminRouter.patch('/companies/:id/verification',asyncHandler(async(req,res)=>{const body=z.object({verificationStatus:z.enum(['PENDING','VERIFIED','REJECTED'])}).parse(req.body);const data=await prisma.company.update({where:{id:String(req.params.id)},data:body});res.json({data});}));
adminRouter.get('/jobs',asyncHandler(async(_req,res)=>{const data=await prisma.job.findMany({include:{company:{select:{name:true,slug:true}},_count:{select:{applications:true}}},orderBy:{createdAt:'desc'}});res.json({data});}));
