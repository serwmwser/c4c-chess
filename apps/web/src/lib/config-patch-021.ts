export interface GameClock { white: number; black: number; turn: 'w' | 'b'; active: boolean; finished: boolean; winner: 'w' | 'b' | null; }

export function initClock(seconds: number): GameClock { return { white: seconds, black: seconds, turn: 'w', active: true, finished: false, winner: null }; }

export function tickClock(c: GameClock): GameClock {
  if (!c.active || c.finished) return c;
  const next = { ...c };
  const key = next.turn === 'w' ? 'white' : 'black';
  next[key] = Math.max(0, next[key] - 1);
  if (next[key] === 0) { next.finished = true; next.winner = next.turn === 'w' ? 'b' : 'w'; next.active = false; }
  return next;
}

export function makeMove(c: GameClock): GameClock {
  if (!c.active || c.finished) return c;
  return { ...c, turn: c.turn === 'w' ? 'b' : 'w' };
}

export function formatClock(seconds: number): string {
  const m = Math.floor(seconds / 60); const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export const PATCH_021 = { initClock, tickClock, makeMove, formatClock };
export type { GameClock };
