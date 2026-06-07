import { create } from 'zustand';
import { Habit, CreateHabitInput, habitRepository } from '../repositories/habitRepository';
import { habitLogRepository } from '../repositories/habitLogRepository';
import { progressRepository } from '../repositories/progressRepository';
import { XP_PER_HABIT } from '../utils/xp';

interface HabitWithStatus extends Habit {
  completedToday: boolean;
}

interface HabitState {
  habits: HabitWithStatus[];
  loading: boolean;
  loadHabits: () => void;
  addHabit: (input: CreateHabitInput) => Habit;
  updateHabit: (id: string, input: Partial<CreateHabitInput & { notification_id: string | null }>) => void;
  deleteHabit: (id: string) => void;
  toggleComplete: (habitId: string) => void;
}

export const useHabitStore = create<HabitState>((set, get) => ({
  habits: [],
  loading: false,

  loadHabits() {
    set({ loading: true });
    const all = habitRepository.getAll();
    const habits: HabitWithStatus[] = all.map((h) => ({
      ...h,
      completedToday: habitLogRepository.isCompletedToday(h.id),
    }));
    set({ habits, loading: false });
  },

  addHabit(input) {
    const habit = habitRepository.create(input);
    get().loadHabits();
    return habit;
  },

  updateHabit(id, input) {
    habitRepository.update(id, input);
    get().loadHabits();
  },

  deleteHabit(id) {
    habitRepository.softDelete(id);
    get().loadHabits();
  },

  toggleComplete(habitId) {
    const already = habitLogRepository.isCompletedToday(habitId);
    if (already) {
      habitLogRepository.removeCompletion(habitId);
      progressRepository.removeXP(XP_PER_HABIT);
    } else {
      habitLogRepository.logCompletion(habitId);
      progressRepository.addXP(XP_PER_HABIT);
    }
    get().loadHabits();
  },
}));
