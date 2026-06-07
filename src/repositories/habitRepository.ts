import { db } from '../database/db';
import type { SQLiteBindParams } from 'expo-sqlite';
import { generateId } from '../utils/id';

export type Frequency = 'daily' | 'weekly';

export interface Habit {
  id: string;
  title: string;
  description: string | null;
  frequency: Frequency;
  reminder_time: string | null;
  notification_id: string | null;
  active: number;
  created_at: string;
}

export interface CreateHabitInput {
  title: string;
  description?: string;
  frequency: Frequency;
  reminder_time?: string;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export const habitRepository = {
  getAll(): Habit[] {
    return db.getAllSync<Habit>(
      'SELECT * FROM habits WHERE active = 1 ORDER BY created_at ASC'
    );
  },

  getById(id: string): Habit | null {
    return db.getFirstSync<Habit>('SELECT * FROM habits WHERE id = ?', [id]) ?? null;
  },

  create(input: CreateHabitInput): Habit {
    const id = generateId();
    const now = new Date().toISOString();
    db.runSync(
      `INSERT INTO habits (id, title, description, frequency, reminder_time, active, created_at)
       VALUES (?, ?, ?, ?, ?, 1, ?)`,
      [id, input.title, input.description ?? null, input.frequency, input.reminder_time ?? null, now]
    );
    return this.getById(id)!;
  },

  update(id: string, input: Partial<CreateHabitInput & { notification_id: string | null }>): void {
    const fields: string[] = [];
    const values: unknown[] = [];

    if (input.title !== undefined) { fields.push('title = ?'); values.push(input.title); }
    if (input.description !== undefined) { fields.push('description = ?'); values.push(input.description); }
    if (input.frequency !== undefined) { fields.push('frequency = ?'); values.push(input.frequency); }
    if (input.reminder_time !== undefined) { fields.push('reminder_time = ?'); values.push(input.reminder_time); }
    if (input.notification_id !== undefined) { fields.push('notification_id = ?'); values.push(input.notification_id); }

    if (fields.length === 0) return;
    values.push(id);
    db.runSync(`UPDATE habits SET ${fields.join(', ')} WHERE id = ?`, values as SQLiteBindParams);
  },

  softDelete(id: string): void {
    db.runSync('UPDATE habits SET active = 0 WHERE id = ?', [id]);
  },

  getTodayCompleted(): Habit[] {
    return db.getAllSync<Habit>(
      `SELECT h.* FROM habits h
       INNER JOIN habit_logs l ON l.habit_id = h.id AND l.completed_date = ?
       WHERE h.active = 1`,
      [today()]
    );
  },

  getAllForBackup(): Habit[] {
    return db.getAllSync<Habit>('SELECT * FROM habits');
  },
};
