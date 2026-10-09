import { api } from './client';

export type PublishedJob = {
  id: string;
  title: string;
  description: string;
  requirements: string | null;
  category: string;
  location: string | null;
  workplaceType: 'ONSITE' | 'HYBRID' | 'REMOTE';
  employmentType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'FREELANCE';
  experienceLevel: 'ENTRY' | 'JUNIOR' | 'MID' | 'SENIOR' | 'LEAD' | 'EXECUTIVE';
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string;
  publishedAt: string | null;
  company: { name: string; slug: string; logoUrl: string | null };
};

export type ApplicationSubmission = { id: string; status: string };
export type MyApplication = {
  id: string;
  status: 'SUBMITTED' | 'REVIEWING' | 'SHORTLISTED' | 'INTERVIEW' | 'OFFER' | 'REJECTED' | 'HIRED';
  appliedAt: string;
  job: { title: string; company: { name: string; slug: string } };
};

export type JobFilters = {
  q?: string;
  location?: string;
  category?: string;
};

export function listJobs(filters: JobFilters = {}, signal?: AbortSignal) {
  const query = new URLSearchParams({ page: '1', limit: '100' });
  if (filters.q) query.set('q', filters.q);
  if (filters.location) query.set('location', filters.location);
  if (filters.category) query.set('category', filters.category);
  return api<PublishedJob[]>(`/jobs?${query.toString()}`, { signal });
}

export function listJobCategories(signal?: AbortSignal) {
  return api<string[]>('/jobs/categories', { signal });
}

export function applyToJob(jobId: string) {
  return api<ApplicationSubmission>(`/jobs/${encodeURIComponent(jobId)}/applications`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

export function listMyApplications() {
  return api<MyApplication[]>('/applications/me?page=1&limit=100');
}
