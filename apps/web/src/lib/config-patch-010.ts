// 🔹 ПАТЧ 10: Логика игр, таймаут 24ч, валидация, запись ходов
export type GameStatus = 'waiting' | 'active' | 'finished' | 'refunded' | 'drawn';

export interface GameSession {
  id: string;
  creator: string;
  opponent: string;
  stake: number;
  timeControl: number;
  status: GameStatus;
  pgn: string;
  moves: string[];
  createdAt: number;
  expiresAt: number; // 🔥 Таймаут 24ч
}

export const VALID_STAKES = [50000, 100000, 250000, 500000, 1000000] as const;
export const VALID_TIMES = [300, 900, 1800, 3600, 86400] as const;

export function validateGameConfig(stake: number, time: number): boolean {
  return (VALID_STAKES as readonly number[]).includes(stake) && (VALID_TIMES as readonly number[]).includes(time);
}

export function createTokenGameSession(creator: string, stake: number, time: number): GameSession {
  const session: GameSession = {
    id: `g_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    creator, opponent: '', stake, timeControl: time,
    status: 'waiting', pgn: '', moves: [], createdAt: Date.now(),
    expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 🔥 24 часа
  };
  const games = JSON.parse(localStorage.getItem('c4c-active-games') || '[]');
  games.push(session);
  localStorage.setItem('c4c-active-games', JSON.stringify(games));
  return session;
}

export function recordGameMove(gameId: string, moveSan: string, pgnHistory: string) {
  const games = JSON.parse(localStorage.getItem('c4c-active-games') || '[]');
  const idx = games.findIndex((g: any) => g.id === gameId);
  if (idx !== -1) {
    games[idx].moves.push(moveSan);
    games[idx].pgn = pgnHistory;
    if (games[idx].status === 'waiting') games[idx].status = 'active';
    localStorage.setItem('c4c-active-games', JSON.stringify(games));
  }
}

export function canRefundGame(game: GameSession): boolean {
  return game.status === 'waiting' && Date.now() > game.expiresAt && game.opponent === '';
}

export function getMyActiveGames(address: string): GameSession[] {
  const games = JSON.parse(localStorage.getItem('c4c-active-games') || '[]');
  return games.filter((g: any) => g.creator === address || g.opponent === address);
}

export const PATCH_010 = { VALID_STAKES, VALID_TIMES, validateGameConfig, createTokenGameSession, recordGameMove, canRefundGame, getMyActiveGames };
