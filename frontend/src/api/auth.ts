import { api } from './client';

export type Role = 'JOB_SEEKER' | 'COMPANY';
export type AuthResponse = { accessToken?: string };

export const register = (email: string, password: string, role: Role) =>
  api<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify({ email, password, role }) });

export const login = (email: string, password: string) =>
  api<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });

