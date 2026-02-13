#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const { DatabaseSync } = require('node:sqlite');

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

function run(command) {
  execSync(command, {
    cwd: backendRoot,
    stdio: 'inherit',
    env,
  });
}

if ((env.DATABASE_URL || '').includes(DEV_DB_MARKER)) {
  throw new Error('pretest:integration must never use the development database');
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

cleanupTestDatabase();
run('npx prisma generate --schema prisma/schema.prisma');

try {
  applySqlMigrations(TEST_DB_FILE);
} catch (err) {
  console.error(`Integration tests require a dedicated test DB. Init failed: ${err.message}`);
  process.exit(1);
}
