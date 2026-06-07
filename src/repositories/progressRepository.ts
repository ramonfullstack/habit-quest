import { db } from '../database/db';
import { calcLevel } from '../utils/xp';

export interface UserProgress {
  id: string;
  xp: number;
  level: number;
  current_streak: number;
  last_completed_date: string | null;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export const progressRepository = {
  get(): UserProgress {
    return db.getFirstSync<UserProgress>('SELECT * FROM user_progress WHERE id = ?', ['singleton'])!;
  },

  addXP(amount: number): UserProgress {
    const current = this.get();
    const newXP = current.xp + amount;
    const newLevel = calcLevel(newXP);
    const todayStr = today();

    let newStreak = current.current_streak;
    if (current.last_completed_date === todayStr) {
      // already counted today, no change
    } else if (current.last_completed_date === yesterday()) {
      newStreak = current.current_streak + 1;
    } else {
      newStreak = 1;
    }

    db.runSync(
      `UPDATE user_progress SET xp = ?, level = ?, current_streak = ?, last_completed_date = ? WHERE id = 'singleton'`,
      [newXP, newLevel, newStreak, todayStr]
    );

    return this.get();
  },

  removeXP(amount: number): UserProgress {
    const current = this.get();
    const newXP = Math.max(0, current.xp - amount);
    const newLevel = calcLevel(newXP);
    db.runSync(
      `UPDATE user_progress SET xp = ?, level = ? WHERE id = 'singleton'`,
      [newXP, newLevel]
    );
    return this.get();
  },

  reset(): void {
    db.runSync(
      `UPDATE user_progress SET xp = 0, level = 1, current_streak = 0, last_completed_date = NULL WHERE id = 'singleton'`
    );
  },
};
