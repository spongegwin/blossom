export function getBaseUrl(h?: Headers) {
  const env = process.env.NEXT_PUBLIC_SITE_URL
  if (env) return env.replace(/\/$/, '')
  // Fallback for local/preview if env missing
  const host = h?.get('x-forwarded-host') ?? h?.get('host')
  const proto = h?.get('x-forwarded-proto') ?? 'https'
  return host ? `${proto}://${host}` : 'http://localhost:3000'
}
