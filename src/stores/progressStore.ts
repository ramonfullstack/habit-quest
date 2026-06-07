import { create } from 'zustand';
import { UserProgress, progressRepository } from '../repositories/progressRepository';

interface ProgressState extends UserProgress {
  loadProgress: () => void;
}

export const useProgressStore = create<ProgressState>((set) => ({
  id: 'singleton',
  xp: 0,
  level: 1,
  current_streak: 0,
  last_completed_date: null,

  loadProgress() {
    const p = progressRepository.get();
    set(p);
  },
}));
