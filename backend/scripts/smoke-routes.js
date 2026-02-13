#!/usr/bin/env node

/*
 * Simple smoke test for main API routes.
 * The script auto-starts backend if it is not already running.
 */

const base = process.env.API_BASE_URL || 'http://localhost:4004';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function req(path, { method = 'GET', token, json } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (json !== undefined) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${base}${path}`, {
    method,
    headers,
    body: json !== undefined ? JSON.stringify(json) : undefined,
  });

  const raw = await res.text();
  let data = null;
  if (raw) {
    try { data = JSON.parse(raw); } catch { data = raw; }
  }

  return { status: res.status, data };
}

function assertStatus(label, status, allowed) {
  const list = Array.isArray(allowed) ? allowed : [allowed];
  if (!list.includes(status)) {
    throw new Error(`${label}: status ${status}, expected ${list.join(', ')}`);
  }
}

async function waitForHealth(maxAttempts = 30, delayMs = 500) {
  for (let i = 0; i < maxAttempts; i += 1) {
    try {
      const health = await req('/api/health');
      if (health.status === 200) return true;
    } catch {
      // ignore while waiting
    }
    await sleep(delayMs);
  }
  return false;
}

function getPortFromBaseUrl() {
  try {
    const parsed = new URL(base);
    if (parsed.port) return Number(parsed.port);
    return parsed.protocol === 'https:' ? 443 : 80;
  } catch {
    return 4004;
  }
}

async function ensureBackend() {
  const alreadyRunning = await waitForHealth(1, 1);
  if (alreadyRunning) {
    return { startedHere: false, server: null };
  }

  process.env.PORT = String(getPortFromBaseUrl());
  process.env.DATABASE_URL = process.env.DATABASE_URL || 'file:./dev.db';

  // eslint-disable-next-line global-require
  const { start } = require('../src/server');
  const server = start(process.env.PORT);

  const healthy = await waitForHealth(40, 500);
  if (!healthy) {
    await new Promise((resolve) => server.close(resolve));
    throw new Error('backend non disponible');
  }

  return { startedHere: true, server };
}

async function main() {
  const backend = await ensureBackend();
  const email = `smoke.${Date.now()}@test.local`;
  try {
    const health = await req('/api/health');
    assertStatus('health', health.status, 200);

    const register = await req('/api/auth/register', {
      method: 'POST',
      json: {
        name: 'Smoke User',
        email,
        password: 'password123',
        role: 'BUYER',
      },
    });
    assertStatus('register', register.status, 201);

    const token = register.data?.token;
    if (!token) throw new Error('register: missing token');

    const login = await req('/api/auth/login', {
      method: 'POST',
      json: { email, password: 'password123' },
    });
    assertStatus('login', login.status, 200);

    const products = await req('/api/products');
    assertStatus('products', products.status, 200);

    const sellerReq = await req('/api/users/me/request-seller', {
      method: 'POST',
      token,
      json: { message: 'smoke test request' },
    });
    assertStatus('request-seller', sellerReq.status, 201);

    console.log('Smoke test OK');
  } finally {
    if (backend.startedHere && backend.server) {
      await new Promise((resolve) => backend.server.close(resolve));
    }
  }
}

main().catch((err) => {
  console.error('Smoke test failed:', err.message);
  process.exitCode = 1;
});
