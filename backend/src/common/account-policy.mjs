export function canStartSession(user) {
  return user.status === 'ACTIVE' && (user.role === 'ADMIN' || Boolean(user.emailVerifiedAt));
}
