import { db } from '../database/db';
import { generateId } from '../utils/id';

export interface HabitLog {
  id: string;
  habit_id: string;
  completed_date: string;
  created_at: string;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export const habitLogRepository = {
  logCompletion(habitId: string): void {
    const id = generateId();
    const now = new Date().toISOString();
    db.runSync(
      `INSERT OR IGNORE INTO habit_logs (id, habit_id, completed_date, created_at)
       VALUES (?, ?, ?, ?)`,
      [id, habitId, today(), now]
    );
  },

  removeCompletion(habitId: string, date?: string): void {
    db.runSync(
      'DELETE FROM habit_logs WHERE habit_id = ? AND completed_date = ?',
      [habitId, date ?? today()]
    );
  },

  isCompletedToday(habitId: string): boolean {
    const row = db.getFirstSync<{ count: number }>(
      'SELECT COUNT(*) as count FROM habit_logs WHERE habit_id = ? AND completed_date = ?',
      [habitId, today()]
    );
    return (row?.count ?? 0) > 0;
  },

  getLogsForRange(startDate: string, endDate: string): HabitLog[] {
    return db.getAllSync<HabitLog>(
      `SELECT * FROM habit_logs WHERE completed_date >= ? AND completed_date <= ? ORDER BY completed_date ASC`,
      [startDate, endDate]
    );
  },

  getAllForBackup(): HabitLog[] {
    return db.getAllSync<HabitLog>('SELECT * FROM habit_logs');
  },

  deleteAll(): void {
    db.runSync('DELETE FROM habit_logs');
  },
};
