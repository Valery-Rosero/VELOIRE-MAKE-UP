// Sliding window rate limiter — in-memory, per server instance.
// Suitable for single-instance deployments (Vercel serverless, VPS).
// For multi-instance scale, replace with Upstash Redis.

const store = new Map<string, number[]>()

export function isRateLimited(
  key: string,
  limit: number,
  windowMs: number,
): boolean {
  const now = Date.now()
  const timestamps = (store.get(key) ?? []).filter((t) => now - t < windowMs)

  if (timestamps.length >= limit) return true

  timestamps.push(now)
  store.set(key, timestamps)
  return false
}

export function getClientIp(headers: Headers): string {
  return (
    headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    headers.get('x-real-ip') ??
    'unknown'
  )
}
