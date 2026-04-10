// Bucket Keeper - Database Initialization & Helpers

import { Platform } from 'react-native';
import type * as SQLite from 'expo-sqlite';
import { MIGRATIONS, CURRENT_VERSION } from './schema';

const DB_NAME = 'bucketkeeper.db';

let db: SQLite.SQLiteDatabase | null = null;

/**
 * Returns the singleton database instance.
 * Throws if `initDatabase()` has not been called yet (or on web).
 */
export function getDatabase(): SQLite.SQLiteDatabase {
  if (!db) {
    throw new Error(
      'Database not initialized. Call initDatabase() before accessing the database.'
    );
  }
  return db;
}

/**
 * Opens the database, enables WAL mode and foreign keys,
 * then runs any pending migrations.
 * Returns null on web (SQLite not supported).
 */
export function initDatabase(): SQLite.SQLiteDatabase | null {
  if (db) return db;

  // expo-sqlite doesn't support web
  if (Platform.OS === 'web') {
    console.warn('SQLite is not available on web. Using API-only mode.');
    return null;
  }

  // Use require so web bundler doesn't eagerly resolve the native module
  const SQLiteModule = require('expo-sqlite');
  db = SQLiteModule.openDatabaseSync(DB_NAME);

  // Enable WAL for better concurrent read performance
  db!.execSync('PRAGMA journal_mode = WAL;');
  // Enforce foreign key constraints
  db!.execSync('PRAGMA foreign_keys = ON;');

  runMigrations(db!);

  return db;
}

/**
 * Runs all migrations whose version is greater than the current DB version.
 */
function runMigrations(database: SQLite.SQLiteDatabase): void {
  // Ensure the migrations meta-table exists
  database.execSync(
    `CREATE TABLE IF NOT EXISTS _migrations (
      version INTEGER PRIMARY KEY NOT NULL,
      appliedAt INTEGER NOT NULL
    );`
  );

  const row = database.getFirstSync<{ maxVersion: number | null }>(
    'SELECT MAX(version) as maxVersion FROM _migrations;'
  );
  const currentVersion = row?.maxVersion ?? 0;

  const pending = MIGRATIONS.filter((m) => m.version > currentVersion).sort(
    (a, b) => a.version - b.version
  );

  for (const migration of pending) {
    database.execSync('BEGIN TRANSACTION;');
    try {
      for (const statement of migration.up) {
        database.execSync(statement);
      }
      database.runSync(
        'INSERT INTO _migrations (version, appliedAt) VALUES (?, ?);',
        migration.version,
        Date.now()
      );
      database.execSync('COMMIT;');
    } catch (error) {
      database.execSync('ROLLBACK;');
      throw new Error(
        `Migration to version ${migration.version} failed: ${error}`
      );
    }
  }
}

/**
 * Generates a random 16-byte hex string (32 characters) to use as a primary key.
 * No external dependencies required.
 */
export function generateId(): string {
  const bytes = new Uint8Array(16);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Closes the database connection and resets the singleton.
 * Useful for testing or cleanup.
 */
export function closeDatabase(): void {
  if (db) {
    db.closeSync();
    db = null;
  }
}
