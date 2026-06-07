import { db } from './db';

export function runMigrations() {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS habits (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      frequency TEXT NOT NULL DEFAULT 'daily',
      reminder_time TEXT,
      notification_id TEXT,
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS habit_logs (
      id TEXT PRIMARY KEY,
      habit_id TEXT NOT NULL,
      completed_date TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (habit_id) REFERENCES habits(id)
    );

    CREATE TABLE IF NOT EXISTS user_progress (
      id TEXT NOT NULL DEFAULT 'singleton' PRIMARY KEY,
      xp INTEGER NOT NULL DEFAULT 0,
      level INTEGER NOT NULL DEFAULT 1,
      current_streak INTEGER NOT NULL DEFAULT 0,
      last_completed_date TEXT
    );

    INSERT OR IGNORE INTO user_progress (id, xp, level, current_streak)
    VALUES ('singleton', 0, 1, 0);
  `);
}
