type Params = unknown[] | Record<string, unknown> | undefined;

function warnWebSqliteUse(sql: string): void {
  if (__DEV__) {
    console.warn(`[HabitQuest] SQLite is disabled on web fallback. Ignoring SQL: ${sql.slice(0, 60)}...`);
  }
}

export const db = {
  execSync(sql: string): void {
    warnWebSqliteUse(sql);
  },

  runSync(sql: string, _params?: Params): void {
    warnWebSqliteUse(sql);
  },

  getAllSync<T>(_sql: string, _params?: Params): T[] {
    return [];
  },

  getFirstSync<T>(_sql: string, _params?: Params): T | null {
    return null;
  },
};
