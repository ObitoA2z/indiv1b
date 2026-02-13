#!/usr/bin/env node

/*
 * Integration tests (API + DB) without a full test runner.
 * Uses a dedicated SQLite database and fails explicitly if DB init fails.
 */

const path = require('path');
const fs = require('fs');
const { DatabaseSync } = require('node:sqlite');

const bcrypt = require('bcryptjs');
const request = require('supertest');

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
process.env.FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

const backendRoot = path.resolve(__dirname, '..');
process.chdir(backendRoot);
const TEST_DB_FILENAME = 'test.integration.db';
const TEST_DB_FILE = path.join(backendRoot, 'prisma', TEST_DB_FILENAME);
const TEST_DB_URL = 'file:./test.integration.db';
const DEV_DB_MARKER = ['dev', 'db'].join('.');

function removeFileIfExists(file) {
  if (fs.existsSync(file)) {
    fs.unlinkSync(file);
  }
}

function cleanupTestDatabase() {
  removeFileIfExists(TEST_DB_FILE);
  removeFileIfExists(`${TEST_DB_FILE}-wal`);
  removeFileIfExists(`${TEST_DB_FILE}-shm`);
}

function enforceDedicatedDbUrl() {
  const url = process.env.DATABASE_URL || '';
  if (!url) {
    throw new Error('DATABASE_URL is required for integration tests');
  }
  if (url.includes(DEV_DB_MARKER)) {
    throw new Error('Integration tests must never use the development database');
  }
  if (url !== TEST_DB_URL) {
    throw new Error(`Integration tests require DATABASE_URL=${TEST_DB_URL} (received ${url})`);
  }
}

function applySqlMigrations(dbFile) {
  const migrationsRoot = path.join(backendRoot, 'prisma', 'migrations');
  const migrationDirs = fs
    .readdirSync(migrationsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  const db = new DatabaseSync(dbFile);
  try {
    db.exec('PRAGMA foreign_keys = ON;');
    for (const dir of migrationDirs) {
      const sqlPath = path.join(migrationsRoot, dir, 'migration.sql');
      if (!fs.existsSync(sqlPath)) continue;
      const sql = fs.readFileSync(sqlPath, 'utf8');
      if (sql.trim()) {
        db.exec(sql);
      }
    }
  } finally {
    db.close();
  }
}

function initDedicatedTestDb() {
  cleanupTestDatabase();
  process.env.DATABASE_URL = TEST_DB_URL;
  enforceDedicatedDbUrl();

  try {
    applySqlMigrations(TEST_DB_FILE);
  } catch (err) {
    console.error(`Integration tests require a dedicated test DB. Init failed: ${err.message}`);
    process.exit(1);
  }
}

async function main() {
  const runId = Date.now();

  initDedicatedTestDb();

  // Import after DATABASE_URL is set so Prisma uses dedicated test DB
  // eslint-disable-next-line global-require
  const { app } = require('../src/server');
  // eslint-disable-next-line global-require
  const { prisma } = require('../src/prisma');

  try {
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

    // Register a buyer
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

    const buyerLoginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: buyerEmail, password: buyerPassword })
      .expect(200);

    if (!buyerLoginRes.body?.token) {
      throw new Error('Missing JWT token for buyer login');
    }
    const buyerToken = buyerLoginRes.body.token;

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

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: adminEmail, password: adminPassword })
      .expect(200);

    const token = loginRes.body && loginRes.body.token;
    if (!token) {
      throw new Error('Missing JWT token for admin login');
    }

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

    console.log('Integration tests: OK');
  } finally {
    await prisma.$disconnect();
    cleanupTestDatabase();
  }
}

main().catch((err) => {
  console.error(err);
  cleanupTestDatabase();
  process.exit(1);
});
