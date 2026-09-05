// CORS and security header helpers

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '*').split(',').map(o => o.trim())

export function corsHeaders(request) {
  const origin = request?.headers?.get?.('origin') || ''
  const allowed = ALLOWED_ORIGINS.includes('*') || ALLOWED_ORIGINS.includes(origin)
  return {
    'Access-Control-Allow-Origin': allowed ? origin : ALLOWED_ORIGINS[0] || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
}

export function securityHeaders() {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
  }
}

export function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...securityHeaders(), ...corsHeaders() },
  })
}

export function errorResponse(error, status = 500) {
  return new Response(JSON.stringify({ error: error?.message || 'Server Error' }), {
    status,
    headers: { 'Content-Type': 'application/json', ...securityHeaders(), ...corsHeaders() },
  })
}
