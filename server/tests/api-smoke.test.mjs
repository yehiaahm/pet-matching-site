import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const port = 5057;
const baseUrl = `http://127.0.0.1:${port}`;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const waitForServer = async () => {
  const started = Date.now();

  while (Date.now() - started < 20000) {
    try {
      const response = await fetch(`${baseUrl}/api/health`);
      if (response.ok) {
        return;
      }
    } catch {
      await delay(300);
    }
  }

  throw new Error('Server did not start in time');
};

const startServer = () => {
  const processRef = spawn('node', ['src/app.js'], {
    cwd: projectRoot,
    env: {
      ...process.env,
      NODE_ENV: 'test',
      PORT: String(port),
      JWT_SECRET: process.env.JWT_SECRET || 'test_jwt_secret_key_for_ci_only',
      DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/petmat',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  return processRef;
};

const stopServer = async (processRef) => {
  if (!processRef || processRef.killed) return;

  await new Promise((resolve) => {
    processRef.once('exit', () => resolve());
    processRef.kill('SIGTERM');
    setTimeout(() => {
      if (!processRef.killed) {
        processRef.kill('SIGKILL');
      }
      resolve();
    }, 4000);
  });
};

let serverProcess;

test.before(async () => {
  serverProcess = startServer();
  await waitForServer();
});

test.after(async () => {
  await stopServer(serverProcess);
});

test('GET /api/health returns ok', async () => {
  const response = await fetch(`${baseUrl}/api/health`);
  assert.equal(response.status, 200);

  const body = await response.json();
  assert.equal(body.status, 'ok');
  assert.equal(body.service, 'PETMAT API');
});

test('GET /api/health/live returns status endpoint payload', async () => {
  const response = await fetch(`${baseUrl}/api/health/live`);
  assert.ok([200, 503].includes(response.status));

  const body = await response.json();

  if (response.status === 200) {
    assert.equal(typeof body.status, 'string');
    assert.equal(body.status, 'ok');
    assert.equal(body.database, 'ok');
    return;
  }

  assert.equal(response.status, 503);
  assert.match(body.message, /Health check failed/i);
});

test('Unknown route returns 404', async () => {
  const response = await fetch(`${baseUrl}/api/does-not-exist`);
  assert.equal(response.status, 404);

  const body = await response.json();
  assert.equal(body.message, 'Route not found');
});
