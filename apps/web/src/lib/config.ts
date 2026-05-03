// apps/web/src/lib/config.ts

// 🔹 Адреса контрактов
export const C4C_TOKEN_ADDRESS = '0xaac20575371de01b4d10c4e7566d5453d72d56e7' as const;
export const GAME_CONTRACT_ADDRESS = '0xCf5E5d01ADd5e2Ba62B2f6747E5CFC43e36D5005' as const;

// 🔹 Сеть
export const CHAIN_ID = 56 as const;
export const CHAIN_NAME = 'Binance Smart Chain' as const;
export const RPC_URL = 'https://bsc-dataseed.binance.org/' as const;

// 🔹 Приложение
export const APP_NAME = 'C4C Chess' as const;
export const APP_DESCRIPTION = 'Play chess, earn C4C tokens on BSC' as const;
export const WALLETCONNECT_PROJECT_ID = (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_WALLETCONNECT_ID) || 'demo';

// 🔹 Опции
export const TIME_OPTIONS = [
  { label: '5 мин', value: 300 },
  { label: '15 мин', value: 900 },
  { label: '30 мин', value: 1800 },
  { label: '1 час', value: 3600 },
  { label: '24 часа', value: 86400 },
] as const;

export const STAKE_OPTIONS = [
  { label: '50 000', value: 50000 },
  { label: '100 000', value: 100000 },
  { label: '250 000', value: 250000 },
  { label: '500 000', value: 500000 },
  { label: '1 000 000', value: 1000000 },
] as const;

export const BOARD_THEMES = {
  classic: { name: 'Классика', light: '#eeeed2', dark: '#769656' },
  green: { name: 'Зелёная', light: '#b5cf9e', dark: '#3a5f2a' },
  blue: { name: 'Синяя', light: '#c9e4f7', dark: '#2b5f8c' },
  wood: { name: 'Дерево', light: '#f0d9b5', dark: '#b58863' },
} as const;

export const THEMES = {
  default: { name: 'Классика', bg: '#111827', text: '#f9fafb', accent: '#f59e0b' },
  dark: { name: 'Тёмная', bg: '#030712', text: '#f3f4f6', accent: '#6366f1' },
  ocean: { name: 'Океан', bg: '#0c4a6e', text: '#f0f9ff', accent: '#38bdf8' },
  forest: { name: 'Лес', bg: '#064e3b', text: '#ecfdf5', accent: '#34d399' },
} as const;

// 🔹 Утилиты
export function formatTime(seconds: number): string {
  if (seconds >= 3600) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}ч ${m}м`;
  }
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}м ${s.toString().padStart(2, '0')}с`;
}

export function formatC4C(amount: number): string {
  return (amount / 1_000_000).toFixed(6);
}

// 🔹 Логика бота
export function getBotMove(moves: any[]): any {
  if (moves.length === 0) return null;
  const captures = moves.filter((m: any) => m.captured);
  return (captures.length > 0 ? captures : moves)[Math.floor(Math.random() * (captures.length > 0 ? captures.length : moves.length))];
}