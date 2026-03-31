import Database from "better-sqlite3";
import path from "path";
import crypto from "crypto";
import { getSupabaseAdmin } from "./supabase";
import fs from "fs";

const DB_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DB_DIR, "avkast.db");

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (_db) return _db;

  try {
    // Ensure data directory exists
    if (!fs.existsSync(DB_DIR)) {
      console.log("[DB] Creating data directory:", DB_DIR);
      fs.mkdirSync(DB_DIR, { recursive: true });
    }

    _db = new Database(DB_PATH, { verbose: console.log });
    _db.pragma("journal_mode = WAL");
    _db.pragma("foreign_keys = ON");
    initTables(_db);
    return _db;
  } catch (err) {
    console.error("[DB] Failed to initialize database:", err);
    throw new Error("Database initialization failed. Please check permissions and path.");
  }
}

function initTables(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      initial_wealth REAL DEFAULT 0,
      preferred_markets TEXT DEFAULT '',
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

  try { db.exec("ALTER TABLE users ADD COLUMN initial_wealth REAL DEFAULT 0;"); } catch (e) { /* ignore if exists */ }
  try { db.exec("ALTER TABLE users ADD COLUMN preferred_markets TEXT DEFAULT '';"); } catch (e) { /* ignore if exists */ }
}

// ── Password helpers ────────────────────────────────────────

export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return { hash, salt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  if (!password || !hash || !salt) return false;
  try {
    const verifyHash = crypto.scryptSync(password, salt, 64).toString("hex");
    return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(verifyHash, "hex"));
  } catch (err) {
    console.error("[DB] verifyPassword error:", err);
    return false;
  }
}

// ── User helpers ────────────────────────────────────────────

export async function findUserByEmail(email: string): Promise<any | null> {
  const cleanEmail = email.toLowerCase();

  // Try Supabase
  try {
    const supabase = getSupabaseAdmin();
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", cleanEmail)
      .single();
    if (!error && user) return user;
  } catch (err) {}

  // Fallback to SQLite
  const db = getDb();
  return db.prepare("SELECT * FROM users WHERE email = ?").get(cleanEmail);
}

export async function findUserByUsername(username: string): Promise<any | null> {
  // Try Supabase
  try {
    const supabase = getSupabaseAdmin();
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("username", username)
      .single();
    if (!error && user) return user;
  } catch (err) {}

  // Fallback to SQLite
  const db = getDb();
  return db.prepare("SELECT * FROM users WHERE username = ?").get(username);
}

export async function createUser(user: { id: string, username: string, email: string, password_hash: string, salt: string, initial_wealth?: number, preferred_markets?: string }): Promise<void> {
  // Try Supabase
  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("users")
      .insert({
        id: user.id,
        username: user.username,
        email: user.email.toLowerCase(),
        password_hash: user.password_hash,
        salt: user.salt,
        initial_wealth: user.initial_wealth || 0,
        preferred_markets: user.preferred_markets || "[]"
      });
    if (!error) return;
  } catch (err) {}

  // Fallback to SQLite
  const db = getDb();
  db.prepare(
    "INSERT INTO users (id, username, email, password_hash, salt, initial_wealth, preferred_markets) VALUES (?, ?, ?, ?, ?, ?, ?)"
  ).run(
    user.id,
    user.username,
    user.email.toLowerCase(),
    user.password_hash,
    user.salt,
    user.initial_wealth || 0,
    user.preferred_markets || "[]"
  );
}

// ── Watchlist helpers ───────────────────────────────────────

export async function getWatchlist(userId: string): Promise<any[]> {
  // Try Supabase
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("watchlist")
      .select("*")
      .eq("user_id", userId)
      .order("added_at", { ascending: false });
    if (!error && data) return data;
  } catch (err) {}

  // Fallback to SQLite
  const db = getDb();
  return db.prepare("SELECT * FROM watchlist WHERE user_id = ? ORDER BY added_at DESC").all(userId);
}

export async function addToWatchlist(userId: string, item: { id: string, ticker: string, name: string, sector: string }): Promise<void> {
  // Try Supabase
  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("watchlist")
      .insert({
        id: item.id,
        user_id: userId,
        ticker: item.ticker.toUpperCase(),
        name: item.name || "",
        sector: item.sector || ""
      });
    if (!error) return;
  } catch (err) {}

  // Fallback to SQLite
  const db = getDb();
  db.prepare("INSERT INTO watchlist (id, user_id, ticker, name, sector) VALUES (?, ?, ?, ?, ?)").run(
    item.id, userId, item.ticker.toUpperCase(), item.name || "", item.sector || ""
  );
}

export async function removeFromWatchlist(userId: string, ticker: string): Promise<void> {
  // Try Supabase
  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("watchlist")
      .delete()
      .eq("user_id", userId)
      .eq("ticker", ticker.toUpperCase());
    if (!error) return;
  } catch (err) {}

  // Fallback to SQLite
  const db = getDb();
  db.prepare("DELETE FROM watchlist WHERE user_id = ? AND ticker = ?").run(userId, ticker.toUpperCase());
}

// ── Session helpers ─────────────────────────────────────────

export async function createSession(userId: string | null, isGuest: boolean = false): Promise<string> {
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + (isGuest ? 4 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000));
  const sessionId = crypto.randomBytes(16).toString("hex");

  // Try Supabase first (Production/Vercel)
  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("sessions")
      .insert({
        id: sessionId,
        user_id: userId,
        token: token,
        is_guest: isGuest,
        expires_at: expires.toISOString()
      });
    
    if (!error) return token;
    console.warn("[DB] Supabase session creation failed, falling back to SQLite:", error.message);
  } catch (err) {
    console.warn("[DB] Supabase not configured for sessions, falling back to SQLite.");
  }

  // Fallback to SQLite (Local Dev)
  const db = getDb();
  
  if (isGuest) {
    // Ensure a dummy guest user exists if there's a FK constraint
    try {
      db.prepare("INSERT OR IGNORE INTO users (id, username, email, password_hash, salt) VALUES ('guest', 'Guest', 'guest@avkast.local', '', '')").run();
    } catch (e) {}
    userId = "guest";
  }

  db.prepare(
    `INSERT INTO sessions (id, user_id, token, is_guest, expires_at) VALUES (?, ?, ?, ?, ?)`
  ).run(
    sessionId,
    userId,
    token,
    isGuest ? 1 : 0,
    expires.toISOString()
  );

  return token;
}

export async function getSessionUser(token: string): Promise<{ id: string; username: string; email: string; isGuest: boolean; initialWealth?: number; preferredMarkets?: string } | null> {
  // Try Supabase first
  try {
    const supabase = getSupabaseAdmin();
    const { data: session, error } = await supabase
      .from("sessions")
      .select(`
        user_id, is_guest, expires_at,
        users (username, email, initial_wealth, preferred_markets)
      `)
      .eq("token", token)
      .single();

    if (!error && session) {
      if (new Date(session.expires_at) < new Date()) {
        await supabase.from("sessions").delete().eq("token", token);
        return null;
      }
      
      if (session.is_guest) {
        return { id: "guest", username: "Guest", email: "", isGuest: true };
      }

      const user = (session as any).users;
      return {
        id: session.user_id,
        username: user.username,
        email: user.email,
        isGuest: false,
        initialWealth: user.initial_wealth,
        preferredMarkets: user.preferred_markets,
      };
    }
  } catch (err) {
    // Fallback silently to SQLite
  }

  // Fallback to SQLite
  const db = getDb();
  const session = db.prepare(
    `SELECT s.user_id, s.is_guest, s.expires_at, u.username, u.email, u.initial_wealth, u.preferred_markets
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
    initialWealth: session.initial_wealth,
    preferredMarkets: session.preferred_markets,
  };
}

export async function upgradeSession(token: string, userId: string): Promise<void> {
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  // Try Supabase
  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("sessions")
      .update({ user_id: userId, is_guest: false, expires_at: expires })
      .eq("token", token);
    if (!error) return;
  } catch (err) {}

  // Fallback to SQLite
  const db = getDb();
  db.prepare(
    "UPDATE sessions SET user_id = ?, is_guest = 0, expires_at = ? WHERE token = ?"
  ).run(userId, expires, token);
}

export async function deleteSession(token: string): Promise<void> {
  // Try Supabase
  try {
    const supabase = getSupabaseAdmin();
    await supabase.from("sessions").delete().eq("token", token);
  } catch (err) {}

  // Local fallback
  const db = getDb();
  db.prepare(`DELETE FROM sessions WHERE token = ?`).run(token);
}
