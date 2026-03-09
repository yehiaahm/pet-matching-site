const path = require('path');
const { spawn } = require('child_process');

const HOST = '127.0.0.1';
const PORT = 5055;
const BASE_URL = `http://${HOST}:${PORT}`;
const API_BASE = `${BASE_URL}/api/v1`;

let serverProcess;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForServerReady(timeoutMs = 90000) {
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`${API_BASE}/health`);
      if (res.ok) return;
    } catch (error) {
      // server not ready yet
    }
    await delay(1000);
  }

  throw new Error('Backend server did not become ready within timeout');
}

function startServer() {
  const cwd = path.resolve(__dirname, '../../server');

  serverProcess = spawn('node', ['index.js'], {
    cwd,
    env: {
      ...process.env,
      NODE_ENV: 'test',
      HOST,
      PORT: String(PORT),
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  serverProcess.stdout.on('data', () => {});
  serverProcess.stderr.on('data', () => {});

  serverProcess.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      // keep this visible for debugging failing CI runs
      // eslint-disable-next-line no-console
      console.error(`Integration test server exited with code ${code}`);
    }
  });
}

async function stopServer() {
  if (!serverProcess || serverProcess.killed) return;

  await new Promise((resolve) => {
    const timeout = setTimeout(() => {
      try {
        serverProcess.kill('SIGKILL');
      } catch (error) {
        // ignore
      }
      resolve();
    }, 10000);

    serverProcess.once('exit', () => {
      clearTimeout(timeout);
      resolve();
    });

    try {
      serverProcess.kill('SIGTERM');
    } catch (error) {
      clearTimeout(timeout);
      resolve();
    }
  });
}

async function postJson(url, body) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch (error) {
    payload = null;
  }

  return { response, payload };
}

describe('API Integration Tests (Health + Auth)', () => {
  const email = `integration-${Date.now()}@example.com`;
  const password = 'IntegrationPass1';
  const testPetId = '00000000-0000-0000-0000-000000000001';
  let accessToken = '';
  let discoveredPetId = '';

  beforeAll(async () => {
    startServer();
    await waitForServerReady();
  });

  afterAll(async () => {
    await stopServer();
  });

  test('GET /api/v1/health returns healthy response', async () => {
    const response = await fetch(`${API_BASE}/health`);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toHaveProperty('status', 'success');
    expect(body).toHaveProperty('data');
    expect(body.data).toHaveProperty('status', 'healthy');
    expect(body.data).toHaveProperty('database');
  });

  test('POST /api/v1/auth/register creates user and returns access token', async () => {
    const { response, payload } = await postJson(`${API_BASE}/auth/register`, {
      email,
      password,
      firstName: 'Integration',
      lastName: 'Tester',
      phone: '+201000000000',
    });

    expect(response.status).toBe(201);
    expect(payload).toHaveProperty('status', 'success');
    expect(payload).toHaveProperty('data.user.email', email);
    expect(payload).toHaveProperty('data.accessToken');
    expect(payload.data).not.toHaveProperty('refreshToken');
  });

  test('POST /api/v1/auth/register rejects duplicate email', async () => {
    const { response, payload } = await postJson(`${API_BASE}/auth/register`, {
      email,
      password,
      firstName: 'Integration',
      lastName: 'Tester',
      phone: '+201000000000',
    });

    expect(response.status).toBe(409);
    expect(payload).toHaveProperty('status');
    expect(payload).toHaveProperty('message');
  });

  test('POST /api/v1/auth/login returns auth tokens', async () => {
    await delay(1200);

    const { response, payload } = await postJson(`${API_BASE}/auth/login`, {
      email,
      password,
    });

    expect(response.status).toBe(200);
    expect(payload).toHaveProperty('status', 'success');
    expect(payload).toHaveProperty('data.user.email', email);
    expect(payload).toHaveProperty('data.accessToken');
    expect(payload).toHaveProperty('data.refreshToken');

    accessToken = payload.data.accessToken;
  });

  test('GET /api/v1/auth/profile requires authorization and works with bearer token', async () => {
    const unauthorized = await fetch(`${API_BASE}/auth/profile`);
    expect(unauthorized.status).toBe(401);

    const authorized = await fetch(`${API_BASE}/auth/profile`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const body = await authorized.json();

    expect(authorized.status).toBe(200);
    expect(body).toHaveProperty('status', 'success');
    expect(body).toHaveProperty('data.user.email', email);
  });

  test('POST /api/v1/pets with valid payload creates pet successfully', async () => {
    const { response, payload } = await postJson(`${API_BASE}/pets`, {
      name: 'Integration Pet',
      breed: 'Golden Retriever',
      species: 'Dog',
      gender: 'MALE',
      age: 24,
      color: 'Golden',
      weight: 32.5,
      description: 'Created by integration test',
      images: [],
      isVaccinated: true,
      isNeutered: false,
      hasPedigree: false,
    });

    expect(response.status).toBe(201);
    expect(payload).toHaveProperty('status', 'success');
    expect(payload).toHaveProperty('data.pet.id');
    expect(payload).toHaveProperty('data.pet.name', 'Integration Pet');
    expect(payload).toHaveProperty('data.pet.breed', 'Golden Retriever');
  });

  test('POST /api/v1/pets rejects invalid payload', async () => {
    const { response, payload } = await postJson(`${API_BASE}/pets`, {
      name: 'A',
      breed: '',
      species: '',
      gender: 'INVALID',
      age: -1,
    });

    expect(response.status).toBe(400);
    expect(payload).toHaveProperty('status');
    expect(payload).toHaveProperty('message');
  });

  test('GET /api/v1/pets returns paginated pets list', async () => {
    const response = await fetch(`${API_BASE}/pets?page=1&limit=10`);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toHaveProperty('status', 'success');
    expect(body).toHaveProperty('data');
    expect(Array.isArray(body.data)).toBe(true);
    expect(body).toHaveProperty('pagination');

    if (body.data.length > 0 && body.data[0]?.id) {
      discoveredPetId = body.data[0].id;
    }
  });

  test('GET /api/v1/pets/:id returns pet details or not found for valid UUID', async () => {
    const targetPetId = discoveredPetId || testPetId;
    const response = await fetch(`${API_BASE}/pets/${targetPetId}`);
    const body = await response.json();

    expect([200, 400, 404]).toContain(response.status);
    expect(body).toHaveProperty('status');

    if (response.status === 200) {
      expect(body).toHaveProperty('data.pet.id', targetPetId);
    } else {
      expect(body).toHaveProperty('message');
    }
  });

  test('GET /api/v1/matches/:petId rejects unauthenticated requests', async () => {
    const response = await fetch(`${API_BASE}/matches/${testPetId}`);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body).toHaveProperty('status');
  });

  test('POST /api/v1/matches/calculate rejects unauthenticated requests', async () => {
    const { response, payload } = await postJson(`${API_BASE}/matches/calculate`, {
      petId1: testPetId,
      petId2: testPetId,
    });

    expect(response.status).toBe(401);
    expect(payload).toHaveProperty('status');
  });

  test('POST /api/v1/matches/calculate validates self-matching with authorization', async () => {
    const { response, payload } = await postJson(`${API_BASE}/matches/calculate`, {
      petId1: testPetId,
      petId2: testPetId,
    });

    expect(response.status).toBe(401);

    const authorizedResponse = await fetch(`${API_BASE}/matches/calculate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        petId1: testPetId,
        petId2: testPetId,
      }),
    });

    const authorizedBody = await authorizedResponse.json();
    expect(authorizedResponse.status).toBe(400);
    expect(authorizedBody).toHaveProperty('status');
    expect(authorizedBody).toHaveProperty('message', 'Cannot match a pet with itself');
    expect(payload).toHaveProperty('status');
  });

  test('GET /api/v1/matches/:petId with authorization returns current implementation response', async () => {
    const response = await fetch(`${API_BASE}/matches/${testPetId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body).toHaveProperty('status');
    expect(body).toHaveProperty('message', 'Pet not found');
  });
});
