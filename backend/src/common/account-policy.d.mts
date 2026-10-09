type SessionAccount = { status: string; role: string; emailVerifiedAt: Date | null };
export function canStartSession(user: SessionAccount): boolean;
