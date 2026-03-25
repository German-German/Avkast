import Database from "better-sqlite3";
import path from "path";
import crypto from "crypto";

const DB_PATH = path.join(process.cwd(), "data", "avkast.db");

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (_db) return _db;
  _db = new Database(DB_PATH);
  _db.pragma("journal_mode = WAL");
  _db.pragma("foreign_keys = ON");
  initTables(_db);
  return _db;
}

function initTables(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      user_id TEXT,
      token TEXT NOT NULL UNIQUE,
      is_guest INTEGER NOT NULL DEFAULT 0,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS watchlist (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      user_id TEXT NOT NULL,
      ticker TEXT NOT NULL,
      name TEXT NOT NULL DEFAULT '',
      sector TEXT NOT NULL DEFAULT '',
      added_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, ticker)
    );
  `);
}

// ── Password helpers ────────────────────────────────────────

export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return { hash, salt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(derived, "hex"));
}

// ── Session helpers ─────────────────────────────────────────

export function createSession(userId: string | null, isGuest: boolean = false): string {
  const db = getDb();
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + (isGuest ? 4 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000));

  db.prepare(
    `INSERT INTO sessions (id, user_id, token, is_guest, expires_at) VALUES (?, ?, ?, ?, ?)`
  ).run(
    crypto.randomBytes(16).toString("hex"),
    userId,
    token,
    isGuest ? 1 : 0,
    expires.toISOString()
  );

  return token;
}

export function getSessionUser(token: string): { id: string; username: string; email: string; isGuest: boolean } | null {
  const db = getDb();
  const session = db.prepare(
    `SELECT s.user_id, s.is_guest, s.expires_at, u.username, u.email
     FROM sessions s LEFT JOIN users u ON s.user_id = u.id
     WHERE s.token = ?`
  ).get(token) as any;

  if (!session) return null;
  if (new Date(session.expires_at) < new Date()) {
    db.prepare(`DELETE FROM sessions WHERE token = ?`).run(token);
    return null;
  }

  if (session.is_guest) {
    return { id: "guest", username: "Guest", email: "", isGuest: true };
  }

  return {
    id: session.user_id,
    username: session.username,
    email: session.email,
    isGuest: false,
  };
}

export function deleteSession(token: string): void {
  const db = getDb();
  db.prepare(`DELETE FROM sessions WHERE token = ?`).run(token);
}
