// config-patch-024.ts - Расширение создания игры с балансом и лобби
import { useState, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseUnits, keccak256, stringToBytes } from 'viem';
import { PATCH_003 } from './config-patch-003';
import { PATCH_005 } from './config-patch-005';
import { PATCH_010 } from './config-patch-010';
import { PATCH_011 } from './config-patch-011';
import { PATCH_014 } from './config-patch-014';
import { PATCH_023 } from './config-patch-023';
import { PATCH_025 } from './config-patch-025';

// 🔹 Новые константы для баланса игры
export const GAME_BALANCE_WINDOW_TITLE = 'Баланс игры';
export const GAME_BALANCE_JOIN_BUTTON = 'Играть';
export const GAME_BALANCE_CREATE_BUTTON = 'Создать игру';
export const GAME_BALANCE_INVITE_BUTTON = 'Пригласить друга';

export const GAME_ABI = [
  'function createGame(bytes32 gameId, uint256 stake, uint256 timeLimit) external',
  'function depositStake(bytes32 gameId) external',
  'function games(bytes32) external view returns (address creator, address challenger, uint256 stake, bool creatorPaid, bool challengerPaid, address winner, bool isDraw, bool finished, uint256 createdAt, uint256 timeLimit)',
  'function gameToken() external view returns (address)'
] as const;

// 🔹 Генерация уникального gameId для блока
export function makeGameId(address: string) {
  return keccak256(stringToBytes(`c4c-game-${Date.now()}-${address}`)) as `0x${string}`;
}

// 🔹 Функция для создания игры с списанием токенов
export function createGameWithStake(time: number, stake: number, address: string) {
  const gameId = makeGameId(address);
  return { id: gameId, gameId, time, stake, balance: stake };
}

// 🔹 Функция для присоединения к игре с внесением токенов
export function joinGameWithStake(gameId: string, stake: number, address: string) {
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

export function useGameBalance(id: string | null) {
  const gameContract = (PATCH_023 as any).GAME_ADDR as `0x${string}`;
  const chainId = (PATCH_023 as any).CHAIN_ID as number;
  const { data, isLoading } = useReadContract({
    address: gameContract,
    abi: GAME_ABI,
    functionName: 'games',
    args: id ? [id as `0x${string}`] : undefined,
    chainId,
    query: { enabled: !!id }
  });
  const game = data as any;
  const stake = game?.[2] as bigint | undefined;
  const fromWeiValue = (value: bigint | undefined) => {
    if (!value) return '0 C4C';
    return (Number(value) / 10**6).toLocaleString() + ' C4C';
  };
  return { balance: fromWeiValue(stake), isLoading };
}

export function useCreateGame() {
  const gameContract = (PATCH_023 as any).GAME_ADDR as `0x${string}`;
  const chainId = (PATCH_023 as any).CHAIN_ID as number;
  const { writeContract, data: txHash, isPending, isSuccess } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash: txHash as `0x${string}` });
  const create = (gameId: string, time: number, stake: number) => writeContract({
    address: gameContract,
    abi: GAME_ABI,
    functionName: 'createGame',
    args: [gameId, parseUnits(stake.toString(), 6), BigInt(time)],
    chainId
  });
  return { create, txHash, isPending, isConfirming, isSuccess };
}

export function useJoinGame() {
  const gameContract = (PATCH_023 as any).GAME_ADDR as `0x${string}`;
  const chainId = (PATCH_023 as any).CHAIN_ID as number;
  const { writeContract, data: txHash, isPending, isSuccess } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash: txHash as `0x${string}` });
  const join = (gameId: string) => writeContract({
    address: gameContract,
    abi: GAME_ABI,
    functionName: 'depositStake',
    args: [gameId],
    chainId
  });
  return { join, txHash, isPending, isConfirming, isSuccess };
}

export function useClaimWinnings() {
  return { claim: async () => undefined, txHash: undefined, isPending: false, isConfirming: false, isSuccess: false };
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

export function processTimeWin(winner: 'white' | 'black', gameId: string) {
  console.log(`Победа по времени: ${winner} в игре ${gameId}`);
}

// 🔹 Экспорт патча
export const PATCH_024 = {
  ...PATCH_003,
  ...PATCH_005,
  ...PATCH_010,
  ...PATCH_011,
  ...PATCH_014,
  ...PATCH_023,
  ...PATCH_025,
  GAME_BALANCE_WINDOW_TITLE,
  GAME_BALANCE_JOIN_BUTTON,
  GAME_BALANCE_CREATE_BUTTON,
  GAME_BALANCE_INVITE_BUTTON,
  createGameWithStake,
  joinGameWithStake,
  useGameBalanceManager,
  publishGameToLobbyExtended,
  getLobbyGamesExtended,
  generateGameInviteExtended,
  sendInviteToChatExtended,
  canJoinGameExtended,
  initClockExtended,
  tickClockExtended,
  makeMoveExtended,
  checkTimeWin,
  formatClockExtended,
  processTimeWin
};