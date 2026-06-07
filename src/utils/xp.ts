export const XP_PER_HABIT = 10;

export function calcLevel(xp: number): number {
  return Math.floor(xp / 100) + 1;
}

export function xpForCurrentLevel(level: number): number {
  return (level - 1) * 100;
}

export function xpForNextLevel(level: number): number {
  return level * 100;
}

export function xpProgressInLevel(xp: number): number {
  const level = calcLevel(xp);
  return xp - xpForCurrentLevel(level);
}

export function xpProgressPercent(xp: number): number {
  return xpProgressInLevel(xp) / 100;
}
