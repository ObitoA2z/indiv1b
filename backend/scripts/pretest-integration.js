#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

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

const env = {
  ...process.env,
  DATABASE_URL: TEST_DB_URL,
};

if ((env.DATABASE_URL || '').includes(DEV_DB_MARKER)) {
  throw new Error('pretest:integration must never use the development database');
}

function run(command) {
  execSync(command, {
    cwd: backendRoot,
    stdio: 'inherit',
    env,
  });
}

cleanupTestDatabase();
run('npx prisma generate --schema prisma/schema.prisma');

try {
  run('npx prisma migrate deploy --schema prisma/schema.prisma');
} catch (err) {
  try {
    run('npx prisma db push --force-reset --skip-generate --schema prisma/schema.prisma');
  } catch (pushErr) {
    console.error(`Integration tests require a dedicated test DB. Init failed: ${pushErr.message}`);
    process.exit(1);
  }
}
