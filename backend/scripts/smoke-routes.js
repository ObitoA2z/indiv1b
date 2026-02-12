#!/usr/bin/env node

/*
 * Simple smoke test for main API routes.
 * Requires backend running (default http://localhost:4004).
 */

const base = process.env.API_BASE_URL || 'http://localhost:4004';

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

async function main() {
  const email = `smoke.${Date.now()}@test.local`;

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
}

main().catch((err) => {
  console.error('Smoke test failed:', err.message);
  process.exitCode = 1;
});
