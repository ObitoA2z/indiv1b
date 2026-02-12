#!/usr/bin/env node

/*
 * Integration tests (API + DB) without a full test runner.
 * This is intentionally simple for CI pipelines and educational demos.
 */

const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

const bcrypt = require('bcryptjs');
const request = require('supertest');

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
process.env.FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

const backendRoot = path.resolve(__dirname, '..');
const tmpRoot = path.join(backendRoot, '.tmp');

function run(cmd) {
  execSync(cmd, {
    cwd: backendRoot,
    stdio: 'inherit',
    env: process.env,
  });
}

async function main() {
  // Use a temporary SQLite DB in repo workspace for cross-platform Prisma stability
  if (!fs.existsSync(tmpRoot)) {
    fs.mkdirSync(tmpRoot, { recursive: true });
  }
  const tmpDir = fs.mkdtempSync(path.join(tmpRoot, 'epouvante-backend-it-'));
  const dbPath = path.join(tmpDir, 'test.db');

  // Prisma accepts absolute paths with the sqlite "file:" scheme
  const relativeDbPath = path.relative(backendRoot, dbPath).replace(/\\/g, '/');
  process.env.DATABASE_URL = `file:./${relativeDbPath}`;

  console.log(`Integration tests using DATABASE_URL=${process.env.DATABASE_URL}`);

  // Apply schema on temp DB. Fallback to db push if migrate deploy fails.
  try {
    run('npx prisma migrate deploy --schema prisma/schema.prisma');
  } catch (err) {
    console.warn('migrate deploy failed, fallback to db push --force-reset');
    run('npx prisma db push --force-reset --skip-generate --schema prisma/schema.prisma');
  }

  // Import after DATABASE_URL is set so Prisma uses the right DB
  // eslint-disable-next-line global-require
  const { app } = require('../src/server');
  // eslint-disable-next-line global-require
  const { prisma } = require('../src/prisma');

  // Create an active admin account directly in DB (simplifies auth flow for tests)
  const adminEmail = 'admin@test.local';
  const adminPassword = 'Admin!234';
  const adminHash = await bcrypt.hash(adminPassword, 10);

  await prisma.user.create({
    data: {
      name: 'Admin',
      email: adminEmail,
      password: adminHash,
      role: 'ADMIN',
      active: true,
    },
  });

  // Health check
  const healthRes = await request(app).get('/api/health').expect(200);
  if (!healthRes.body || healthRes.body.status !== 'ok') {
    throw new Error('Health check failed');
  }

  // Register a buyer (account is active immediately)
  const buyerEmail = 'buyer@test.local';
  const buyerPassword = 'Buyer!234';

  const registerRes = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Buyer', email: buyerEmail, password: buyerPassword })
    .expect(201);

  if (!registerRes.body?.token) {
    throw new Error('Missing JWT token after registration');
  }

  // Login should succeed directly
  const buyerLoginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: buyerEmail, password: buyerPassword })
    .expect(200);

  if (!buyerLoginRes.body?.token) {
    throw new Error('Missing JWT token for buyer login');
  }

  // Admin can login
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: adminEmail, password: adminPassword })
    .expect(200);

  const token = loginRes.body && loginRes.body.token;
  if (!token) {
    throw new Error('Missing JWT token for admin login');
  }

  // Admin-only endpoint
  const usersRes = await request(app)
    .get('/api/admin/users')
    .set('Authorization', `Bearer ${token}`)
    .expect(200);

  if (typeof usersRes.body?.total !== 'number' || !Array.isArray(usersRes.body?.items)) {
    throw new Error('Unexpected response shape from /api/admin/users');
  }

  await prisma.$disconnect();

  // Cleanup temp DB folder (best-effort)
  try {
    fs.rmSync(tmpDir, { recursive: true, force: true });
    if (fs.existsSync(tmpRoot) && fs.readdirSync(tmpRoot).length === 0) {
      fs.rmdirSync(tmpRoot);
    }
  } catch {
    // ignore
  }

  console.log('Integration tests: OK');
}

main().catch(async (err) => {
  console.error(err);
  try {
    // eslint-disable-next-line global-require
    const { prisma } = require('../src/prisma');
    await prisma.$disconnect();
  } catch {
    // ignore
  }
  process.exitCode = 1;
});
