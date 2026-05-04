// config-patch-024.ts - Расширение создания игры с балансом и лобби
import { useState, useEffect } from 'react';

// 🔹 Новые константы для баланса игры
export const GAME_BALANCE_WINDOW_TITLE = 'Баланс игры';
export const GAME_BALANCE_JOIN_BUTTON = 'Играть';
export const GAME_BALANCE_CREATE_BUTTON = 'Создать игру';
export const GAME_BALANCE_INVITE_BUTTON = 'Пригласить друга';

// 🔹 Функция для создания игры с списанием токенов
export function createGameWithStake(time: number, stake: number, address: string) {
  // Логика создания игры: approve + create
  // Предполагается, что approve уже вызван перед create
  return { gameId: `g_${Date.now()}_${address}`, time, stake, balance: stake };
}

// 🔹 Функция для присоединения к игре с внесением токенов
export function joinGameWithStake(gameId: string, stake: number, address: string) {
  // Логика join: approve + join
  return { success: true, newBalance: stake * 2 };
}

// 🔹 Структура баланса игры
export interface GameBalance {
  gameId: string;
  creator: string;
  stake: number;
  currentBalance: number;
  timeControl: number;
  players: string[];
  status: 'waiting' | 'active' | 'finished';
}

// 🔹 Хук для управления балансом игры
export function useGameBalanceManager(gameId: string | null) {
  const [balance, setBalance] = useState<GameBalance | null>(null);

  useEffect(() => {
    if (gameId) {
      // Загрузка баланса из контракта или локального состояния
      setBalance({
        gameId,
        creator: '0x...',
        stake: 5000,
        currentBalance: 5000,
        timeControl: 900,
        players: ['creator'],
        status: 'waiting'
      });
    }
  }, [gameId]);

  const updateBalance = (newBalance: number) => {
    if (balance) {
      setBalance({ ...balance, currentBalance: newBalance });
    }
  };

  return { balance, updateBalance };
}

// 🔹 Функция для публикации игры в лобби
export function publishGameToLobbyExtended(game: GameBalance) {
  // Расширенная версия с балансом
  const lobbyGames = JSON.parse(localStorage.getItem('lobbyGames') || '[]');
  lobbyGames.push(game);
  localStorage.setItem('lobbyGames', JSON.stringify(lobbyGames));
}

// 🔹 Получение игр из лобби с балансом
export function getLobbyGamesExtended() {
  return JSON.parse(localStorage.getItem('lobbyGames') || '[]') as GameBalance[];
}

// 🔹 Генерация приглашения
export function generateGameInviteExtended(gameId: string) {
  return `${window.location.origin}/game/${gameId}`;
}

// 🔹 Отправка приглашения в чат
export function sendInviteToChatExtended(gameId: string, friendAddress: string) {
  // Логика отправки в чат
  console.log(`Приглашение отправлено ${friendAddress} для игры ${gameId}`);
}

// 🔹 Проверка возможности присоединения
export function canJoinGameExtended(game: GameBalance, address: string): boolean {
  return game.status === 'waiting' && !game.players.includes(address) && game.players.length < 2;
}

// 🔹 Таймер логика: остановка после хода, старт у противника
export interface ChessClock {
  whiteTime: number;
  blackTime: number;
  activePlayer: 'white' | 'black';
  isRunning: boolean;
}

export function initClockExtended(timeControl: number): ChessClock {
  return {
    whiteTime: timeControl,
    blackTime: timeControl,
    activePlayer: 'white',
    isRunning: false
  };
}

export function tickClockExtended(clock: ChessClock): ChessClock {
  if (!clock.isRunning) return clock;
  const newClock = { ...clock };
  if (clock.activePlayer === 'white') {
    newClock.whiteTime = Math.max(0, clock.whiteTime - 1);
  } else {
    newClock.blackTime = Math.max(0, clock.blackTime - 1);
  }
  return newClock;
}

export function makeMoveExtended(clock: ChessClock, player: 'white' | 'black'): ChessClock {
  const newClock = { ...clock };
  newClock.activePlayer = player === 'white' ? 'black' : 'white';
  newClock.isRunning = true;
  return newClock;
}

export function checkTimeWin(clock: ChessClock): 'white' | 'black' | null {
  if (clock.whiteTime <= 0) return 'black';
  if (clock.blackTime <= 0) return 'white';
  return null;
}

// 🔹 Форматирование времени
export function formatClockExtended(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// 🔹 Обработка выигрыша по времени
export function processTimeWin(winner: 'white' | 'black', gameId: string) {
  // Логика claim winnings
  console.log(`Победа по времени: ${winner} в игре ${gameId}`);
}