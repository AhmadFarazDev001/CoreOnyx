const rateLimits = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(userId: string, actionType: string, maxRequests = 20, windowMs = 60000): boolean {
  const now = Date.now();
  const key = `${userId}:${actionType}`;
  
  const record = rateLimits.get(key);
  if (!record || now > record.resetTime) {
    rateLimits.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (record.count >= maxRequests) {
    return false;
  }
  
  record.count++;
  return true;
}
