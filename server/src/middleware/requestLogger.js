import { randomUUID } from 'node:crypto';

export const requestLogger = (req, res, next) => {
  const requestId = req.headers['x-request-id'] || randomUUID();
  const start = process.hrtime.bigint();

  req.requestId = requestId;
  res.setHeader('x-request-id', requestId);

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000;
    const log = {
      level: res.statusCode >= 500 ? 'error' : 'info',
      message: 'http_request',
      requestId,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Number(durationMs.toFixed(2)),
      userId: req.user?.id || null,
      ip: req.ip,
      userAgent: req.headers['user-agent'] || null,
      timestamp: new Date().toISOString(),
    };

    const output = JSON.stringify(log);
    if (res.statusCode >= 500) {
      console.error(output);
      return;
    }

    console.log(output);
  });

  next();
};
