# Deployment Strategy

## Services
- Backend (Node.js Express, Postgres via Prisma)
- AI Service (FastAPI + Uvicorn)
- Frontend (Vite React)

## Windows (Dev/Prod)
- Use `START_ALL.bat` for development.
- For production: use PM2 for Node, NSSM for Windows services for AI, and reverse-proxy (IIS/NGINX) to expose ports 80/443.

### PM2
```bash
npm i -g pm2
cd server
pm2 start server.js --name petmat-api
pm2 save
```

### AI Service
```bash
cd ai-service
python -m venv .venv
. .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8001 --workers 2
```

## Docker Compose (Postgres + API)
See `server/docker-compose.yml`. Add AI container separately.

## Environment
Set `AI_SERVICE_URL=http://<host>:8001` in `server/.env`.
