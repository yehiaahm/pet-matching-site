# Common Errors and Fixes

- 429 Too Many Requests: hit rate limiter; adjust `RATE_LIMIT_MAX_REQUESTS` or reduce test load.
- 500 AI Service Unavailable: ensure `ai-service` is running; check `AI_SERVICE_URL` and firewall.
- CORS blocked: add frontend origin to `CORS_ORIGIN` in `.env`.
- JWT invalid: make sure `JWT_SECRET` matches and token not expired.
- Socket not receiving alerts: call `registerUser(userId)` after login and ensure backend reachable.
- Postgres connection failure: verify `DATABASE_URL`, run `setup-database.bat`, ensure service running.
