import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../database/prisma.js';
import { authenticate, authorize } from '../../common/auth.middleware.js';
import { asyncHandler } from '../../common/async.js';
import { AppError } from '../../common/errors.js';

export const profilesRouter=Router();
const profileInput=z.object({firstName:z.string().max(80),lastName:z.string().max(80),headline:z.string().max(180).optional(),bio:z.string().max(5000).optional(),phone:z.string().max(30).optional(),location:z.string().max(120).optional(),yearsOfExperience:z.number().int().min(0).max(80).optional(),skills:z.array(z.string().max(80)).max(50).optional(),experience:z.array(z.unknown()).max(50).optional(),education:z.array(z.unknown()).max(50).optional()});
profilesRouter.get('/profile',authenticate,authorize('JOB_SEEKER'),asyncHandler(async(req,res)=>{const data=await prisma.jobSeekerProfile.findUnique({where:{userId:req.user!.id}});res.json({data});}));
profilesRouter.patch('/profile',authenticate,authorize('JOB_SEEKER'),asyncHandler(async(req,res)=>{
  const input = profileInput.partial().parse(req.body);

  const data = await prisma.jobSeekerProfile.upsert({
    where:{userId:req.user!.id},
    create:{
      userId:req.user!.id,
      ...input,
      experience: input.experience as any,
      education: input.education as any
    },
    update:{
      ...input,
      experience: input.experience as any,
      education: input.education as any
    }
  });

  res.json({data});
}));
profilesRouter.get('/resumes',authenticate,authorize('JOB_SEEKER'),asyncHandler(async(req,res)=>{const data=await prisma.resume.findMany({where:{userId:req.user!.id},orderBy:{createdAt:'desc'}});res.json({data});}));
profilesRouter.post('/resumes',authenticate,authorize('JOB_SEEKER'),asyncHandler(async(req,res)=>{const input=z.object({fileName:z.string().min(1).max(255),storageKey:z.string().min(5).max(500),mimeType:z.string().regex(/^application\/(pdf|msword|vnd\.openxmlformats-officedocument\.wordprocessingml\.document)$/),sizeBytes:z.number().int().positive().max(10_000_000),isDefault:z.boolean().optional()}).parse(req.body);if(input.isDefault)await prisma.resume.updateMany({where:{userId:req.user!.id},data:{isDefault:false}});const data=await prisma.resume.create({data:{...input,userId:req.user!.id}});res.status(201).json({data});}));
profilesRouter.delete('/resumes/:id',authenticate,authorize('JOB_SEEKER'),asyncHandler(async(req,res)=>{
  const resumeId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  const item = await prisma.resume.findFirst({
    where:{
      id:resumeId,
      userId:req.user!.id
    }
  });

  if(!item)throw new AppError(404,'Resume not found');

  await prisma.resume.delete({
    where:{id:item.id}
  });

  res.status(204).send();
}));