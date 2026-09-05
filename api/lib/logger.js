// Structured JSON logging with request context

function formatLog(entry) {
  return JSON.stringify(entry);
}

function shouldLog(level) {
  const envLevel = (process.env.LOG_LEVEL || 'info').toLowerCase();
  const levels = ['debug', 'info', 'warn', 'error'];
  return levels.indexOf(level) >= levels.indexOf(envLevel);
}

export function createRequestContext(req, requestId) {
  return {
    request_id: requestId || crypto.randomUUID(),
    method: req.method,
    path: req.url || '/',
    ip: req.headers?.get?.('x-forwarded-for') || req.headers?.get?.('x-real-ip') || undefined,
    user_agent: req.headers?.get?.('user-agent') || undefined,
    start_time: Date.now(),
  };
}

export const logger = {
  debug(ctx, message, extra = {}) {
    if (!shouldLog('debug')) return;
    console.log(formatLog({ timestamp: new Date().toISOString(), level: 'debug', ...ctx, message, ...extra }));
  },
  info(ctx, message, extra = {}) {
    if (!shouldLog('info')) return;
    console.log(formatLog({ timestamp: new Date().toISOString(), level: 'info', ...ctx, message, ...extra }));
  },
  warn(ctx, message, extra = {}) {
    if (!shouldLog('warn')) return;
    console.warn(formatLog({ timestamp: new Date().toISOString(), level: 'warn', ...ctx, message, ...extra }));
  },
  error(ctx, message, error, extra = {}) {
    if (!shouldLog('error')) return;
    const err = error instanceof Error ? error : error ? new Error(String(error)) : undefined;
    console.error(formatLog({ timestamp: new Date().toISOString(), level: 'error', ...ctx, message, error: err?.message, stack: err?.stack, ...extra }));
  },
  logResponse(ctx, status, extra = {}) {
    const duration = Date.now() - ctx.start_time;
    console.log(formatLog({ timestamp: new Date().toISOString(), level: 'info', request_id: ctx.request_id, method: ctx.method, path: ctx.path, status, duration_ms: duration, ip: ctx.ip, user_agent: ctx.user_agent, ...extra }));
  },
};