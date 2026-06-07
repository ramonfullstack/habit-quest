import { db } from './db';

function hasColumn(table: string, column: string): boolean {
  const rows = db.getAllSync<{ name: string }>(`PRAGMA table_info(${table})`);
  return rows.some((r) => r.name === column);
}

function ensureColumn(table: string, columnDef: string): void {
  const columnName = columnDef.trim().split(/\s+/)[0];
  if (!hasColumn(table, columnName)) {
    db.execSync(`ALTER TABLE ${table} ADD COLUMN ${columnDef}`);
  }
}

export function runMigrations(): boolean {
  try {
    db.execSync('PRAGMA foreign_keys = ON;');
    db.execSync('BEGIN IMMEDIATE;');

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
    `);

    ensureColumn('habits', 'notification_id TEXT');
    ensureColumn('habits', 'active INTEGER NOT NULL DEFAULT 1');
    ensureColumn('user_progress', 'last_completed_date TEXT');

    // Keep only one log per habit per day before creating a unique index.
    db.execSync(`
      DELETE FROM habit_logs
      WHERE rowid NOT IN (
        SELECT MIN(rowid)
        FROM habit_logs
        GROUP BY habit_id, completed_date
      );
    `);

    db.execSync(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_habit_logs_habit_date
      ON habit_logs (habit_id, completed_date);

      CREATE INDEX IF NOT EXISTS idx_habit_logs_date
      ON habit_logs (completed_date);

      CREATE INDEX IF NOT EXISTS idx_habits_active
      ON habits (active);
    `);

    db.runSync(
      `INSERT OR IGNORE INTO user_progress (id, xp, level, current_streak, last_completed_date)
       VALUES ('singleton', 0, 1, 0, NULL)`
    );

    db.execSync('COMMIT;');
    return true;
  } catch (error) {
    try {
      db.execSync('ROLLBACK;');
    } catch {
      // ignore rollback failures
    }
    console.error('Database migration failed', error);
    return false;
  }
}
