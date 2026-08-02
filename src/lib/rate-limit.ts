const rateLimits = new Map<string, { count: number; resetTime: number }>();

/**
 * Simple in-memory rate limiter to prevent abuse on specific actions.
 * @param userId - The ID of the user performing the action.
 * @param actionType - The identifier for the action being limited.
 * @param maxRequests - Maximum allowed requests in the time window.
 * @param windowMs - The time window in milliseconds.
 */
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
