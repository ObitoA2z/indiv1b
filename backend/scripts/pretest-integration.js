#!/usr/bin/env node

const { execSync, spawnSync } = require('child_process');
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

function applySqlMigrationsWithPython(dbFile) {
  const migrationsRoot = path.join(backendRoot, 'prisma', 'migrations');
  const script = `
import pathlib
import sqlite3
import sys

db_file = pathlib.Path(sys.argv[1])
migrations_root = pathlib.Path(sys.argv[2])

conn = sqlite3.connect(db_file)
try:
    conn.execute("PRAGMA foreign_keys = ON;")
    dirs = sorted([p for p in migrations_root.iterdir() if p.is_dir()], key=lambda p: p.name)
    for d in dirs:
        sql_path = d / "migration.sql"
        if not sql_path.exists():
            continue
        sql = sql_path.read_text(encoding="utf-8")
        if sql.strip():
            conn.executescript(sql)
    conn.commit()
finally:
    conn.close()
`;

  const candidates = ['python', 'python3'];
  let lastError = 'Python runtime not available';

  for (const cmd of candidates) {
    const result = spawnSync(cmd, ['-c', script, dbFile, migrationsRoot], {
      cwd: backendRoot,
      encoding: 'utf8',
    });

    if (result.status === 0) {
      return;
    }
    lastError = (result.stderr || result.stdout || '').trim() || lastError;
  }

  throw new Error(lastError);
}

try {
  applySqlMigrationsWithPython(TEST_DB_FILE);
} catch (err) {
  console.error(`Integration tests require a dedicated test DB. Init failed: ${err.message}`);
  process.exit(1);
}
