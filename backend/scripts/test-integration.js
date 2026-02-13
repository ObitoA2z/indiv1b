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
  const runId = Date.now();

  // Use a temporary SQLite DB by default. Allow override for debugging.
  let tmpDir = null;
  if (!process.env.INTEGRATION_DATABASE_URL) {
    if (!fs.existsSync(tmpRoot)) {
      fs.mkdirSync(tmpRoot, { recursive: true });
    }
    tmpDir = fs.mkdtempSync(path.join(tmpRoot, 'epouvante-backend-it-'));
    const dbPath = path.join(tmpDir, 'test.db');
    const relativeDbPath = path.relative(backendRoot, dbPath).replace(/\\/g, '/');
    process.env.DATABASE_URL = `file:./${relativeDbPath}`;
  } else {
    process.env.DATABASE_URL = process.env.INTEGRATION_DATABASE_URL;
  }

  console.log(`Integration tests using DATABASE_URL=${process.env.DATABASE_URL}`);

  // Apply schema on temp DB. Fallback to db push if migrate deploy fails.
  try {
    run('npx prisma migrate deploy --schema prisma/schema.prisma');
  } catch (err) {
    console.warn('migrate deploy failed, fallback to db push --force-reset');
    try {
      run('npx prisma db push --force-reset --skip-generate --schema prisma/schema.prisma');
    } catch (pushErr) {
      // Last-resort fallback for environments where Prisma schema engine fails on fresh temp SQLite.
      console.warn('db push on temp DB failed, fallback to file:./dev.db');
      process.env.DATABASE_URL = 'file:./dev.db';
      run('npx prisma db push --skip-generate --schema prisma/schema.prisma');
    }
  }

  // Import after DATABASE_URL is set so Prisma uses the right DB
  // eslint-disable-next-line global-require
  const { app } = require('../src/server');
  // eslint-disable-next-line global-require
  const { prisma } = require('../src/prisma');

  // Create an active admin account directly in DB (simplifies auth flow for tests)
  const adminEmail = `admin.${runId}@test.local`;
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
  const buyerEmail = `buyer.${runId}@test.local`;
  const buyerPassword = 'Buyer!234';
  const sellerEmail = `seller.${runId}@test.local`;
  const sellerPassword = 'Seller!234';

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
  const buyerToken = buyerLoginRes.body.token;

  // Buyer can create a seller request through both supported endpoints
  await request(app)
    .post('/api/users/me/request-seller')
    .set('Authorization', `Bearer ${buyerToken}`)
    .send({ message: 'Please review my seller request' })
    .expect(201);

  await request(app)
    .post('/api/users/me/upgrade-to-seller')
    .set('Authorization', `Bearer ${buyerToken}`)
    .send({ message: 'Backward-compatible endpoint test' })
    .expect(201);

  // Register/login a seller for product publication flow
  const sellerRegisterRes = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Seller',
      email: sellerEmail,
      password: sellerPassword,
      role: 'SELLER',
      sellerMessage: 'Integration flow seller account',
    })
    .expect(201);

  if (!sellerRegisterRes.body?.token) {
    throw new Error('Missing JWT token after seller registration');
  }

  const sellerLoginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: sellerEmail, password: sellerPassword })
    .expect(200);

  if (!sellerLoginRes.body?.token) {
    throw new Error('Missing JWT token for seller login');
  }
  const sellerToken = sellerLoginRes.body.token;

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

  // Upload endpoint security checks
  await request(app)
    .post('/api/upload')
    .attach('image', Buffer.from('fake image data'), 'no-auth.png')
    .expect(401);

  await request(app)
    .post('/api/upload')
    .set('Authorization', `Bearer ${sellerToken}`)
    .attach('image', Buffer.from('not-an-image'), 'script.txt')
    .expect(400);

  const uploadRes = await request(app)
    .post('/api/upload')
    .set('Authorization', `Bearer ${sellerToken}`)
    .attach('image', Buffer.from('fake image data'), 'valid.png')
    .expect(201);

  if (!uploadRes.body?.url) {
    throw new Error('Upload should return a file URL');
  }

  // End-to-end business flow:
  // seller publishes -> admin approves -> buyer consults -> buyer orders
  const productPayload = {
    title: 'Masque spectral integration',
    description: 'Objet epouvante pour test E2E',
    price: 39.99,
    shipping: 4.5,
    category: 'props',
    images: ['https://example.com/mask.png'],
    location: 'Paris',
  };

  const createProductRes = await request(app)
    .post('/api/products')
    .set('Authorization', `Bearer ${sellerToken}`)
    .send(productPayload)
    .expect(201);

  const productId = createProductRes.body?.id;
  if (!productId) {
    throw new Error('Product creation failed: missing product id');
  }
  if (createProductRes.body?.status !== 'pending') {
    throw new Error('Product should be pending after seller publication');
  }

  // PATCH security: auth required, owner seller or admin only
  await request(app)
    .patch(`/api/products/${productId}`)
    .send({ title: 'Should fail without auth' })
    .expect(401);

  await request(app)
    .patch(`/api/products/${productId}`)
    .set('Authorization', `Bearer ${buyerToken}`)
    .send({ title: 'Should fail for non-owner buyer' })
    .expect(403);

  const sellerPatchRes = await request(app)
    .patch(`/api/products/${productId}`)
    .set('Authorization', `Bearer ${sellerToken}`)
    .send({ title: 'Masque spectral integration - edited by seller' })
    .expect(200);

  if (!sellerPatchRes.body?.title?.includes('edited by seller')) {
    throw new Error('Owner seller patch should update product');
  }

  const adminPatchRes = await request(app)
    .patch(`/api/products/${productId}`)
    .set('Authorization', `Bearer ${token}`)
    .send({ shipping: 6.5 })
    .expect(200);

  if (Number(adminPatchRes.body?.shipping) !== 6.5) {
    throw new Error('Admin patch should update product');
  }

  const approveRes = await request(app)
    .post(`/api/admin/products/${productId}/approve`)
    .set('Authorization', `Bearer ${token}`)
    .expect(200);

  if (approveRes.body?.status !== 'available') {
    throw new Error('Admin approval failed: status is not available');
  }

  const productDetailRes = await request(app)
    .get(`/api/products/${productId}`)
    .expect(200);

  if (productDetailRes.body?.status !== 'available') {
    throw new Error('Product detail should expose available status after approval');
  }

  const orderRes = await request(app)
    .post('/api/orders')
    .set('Authorization', `Bearer ${buyerToken}`)
    .send({ productId, quantity: 2 })
    .expect(201);

  if (!orderRes.body?.id) {
    throw new Error('Order creation failed: missing order id');
  }

  const listOrdersRes = await request(app)
    .get('/api/orders')
    .set('Authorization', `Bearer ${buyerToken}`)
    .expect(200);

  if (!Array.isArray(listOrdersRes.body) || !listOrdersRes.body.some((o) => o.id === orderRes.body.id)) {
    throw new Error('Created order not found in buyer orders list');
  }

  await prisma.$disconnect();

  // Cleanup temp DB folder (best-effort)
  try {
    if (tmpDir) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
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
