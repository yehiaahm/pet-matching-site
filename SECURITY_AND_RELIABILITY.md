# Security and Reliability

- CORS: configured via `server/config/index.js` with origins list and wildcard localhost allowance.
- Rate Limiting: global API and stricter auth limiter.
- Headers: `helmet`, extra headers (`X-Content-Type-Options`, etc.).
- Input Sanitization: remove `$` and `.` keys to mitigate NoSQL-style injection.
- Validation: add `zod` or `express-validator` on endpoints (extend as needed).
- Error Handling: centralized `middleware/errorHandler.js`.
- Logging: `winston` with production logging + morgan.
- Backup: use Postgres backups (pg_dump) and object storage for attachments. Cron backups recommended.
- Monitoring: hook into health route; add metrics with Prometheus (future).
