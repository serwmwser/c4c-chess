import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseUnits } from 'viem';

// 🔹 Константы
export const TIME_CONTROLS = [
  { label: '5 мин', value: 300 }, { label: '15 мин', value: 900 }, { label: '30 мин', value: 1800 },
  { label: '1 час', value: 3600 }, { label: '3 часа', value: 10800 }, { label: '24 часа', value: 86400 }
] as const;

export const STAKE_LEVELS = [5000, 10000, 25000, 50000, 100000, 250000, 500000, 1000000] as const;
export const MIN_STAKE = 5000;
export const C4C_ADDR = '0xaac20575371de01b4d10c4e7566d5453d72d56e7' as `0x${string}`;
export const GAME_ADDR = '0xCf5E5d01ADd5e2Ba62B2f6747E5CFC43e36D5005' as `0x${string}`;
export const CHAIN_ID = 56; 
export const DECIMALS = 6;

// 🔹 ABI
export const C4C_ABI = ['function approve(address spender, uint256 amount) external returns (bool)'] as const;
export const GAME_ABI = [
  'function createGame(uint256 time, uint256 stake) external',
  'function joinGame(uint256 id) external',
  'function claimWinnings(uint256 id) external',
  'function getBalance(uint256 id) external view returns (uint256)'
] as const;

// 🔹 Утилиты (🔥 ИСПРАВЛЕНО: fromWei принимает number | bigint)
export function toWei(n: number) { return parseUnits(n.toString(), DECIMALS); }
export function fromWei(b: bigint | number | undefined) { 
  if (!b) return '0 C4C'; 
  const val = typeof b === 'bigint' ? Number(b) : b;
  return (val / 10**DECIMALS).toLocaleString() + ' C4C'; 
}
export function validateStake(s: number): boolean { 
  return (STAKE_LEVELS as readonly number[]).includes(s); 
}
export function formatPrizePool(s: number): string { return `${(s * 2).toLocaleString()} C4C`; }

// 🔹 wagmi v2 Hooks
export function useApproveC4C() {
  const { writeContract, data: txHash, isPending, isSuccess } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash: txHash as `0x${string}` });
  const approve = (stake: number) => writeContract({ 
    address: C4C_ADDR, abi: C4C_ABI, functionName: 'approve', 
    args: [GAME_ADDR, toWei(stake)], chainId: CHAIN_ID 
  });
  return { approve, txHash, isPending, isConfirming, isSuccess };
}

export function useCreateGame() {
  const { writeContract, data: txHash, isPending, isSuccess } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash: txHash as `0x${string}` });
  const create = (time: number, stake: number) => writeContract({ 
    address: GAME_ADDR, abi: GAME_ABI, functionName: 'createGame', 
    args: [BigInt(time), toWei(stake)], chainId: CHAIN_ID 
  });
  return { create, txHash, isPending, isConfirming, isSuccess };
}

export function useJoinGame() {
  const { writeContract, data: txHash, isPending, isSuccess } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash: txHash as `0x${string}` });
  const join = (id: string) => {
    const numericId = BigInt(id.replace('g_','').split('_')[0]);
    return writeContract({ 
      address: GAME_ADDR, abi: GAME_ABI, functionName: 'joinGame', 
      args: [numericId], chainId: CHAIN_ID 
    });
  };
  return { join, txHash, isPending, isConfirming, isSuccess };
}

export function useClaimWinnings() {
  const { writeContract, data: txHash, isPending, isSuccess } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash: txHash as `0x${string}` });
  const claim = (id: string) => {
    const numericId = BigInt(id.replace('g_','').split('_')[0]);
    return writeContract({ 
      address: GAME_ADDR, abi: GAME_ABI, functionName: 'claimWinnings', 
      args: [numericId], chainId: CHAIN_ID 
    });
  };
  return { claim, txHash, isPending, isConfirming, isSuccess };
}

// 🔹 Чтение баланса (безопасная индексация)
export function useGameBalance(id: string | null) {
  const {  data, isLoading } = useReadContract({ 
    address: GAME_ADDR, abi: GAME_ABI, functionName: 'getBalance', 
    args: id ? [BigInt(id.replace('g_','').split('_')[0])] : undefined, 
    chainId: CHAIN_ID, 
    query: { enabled: !!id } 
  });
  const dataAsArray = data as any;
  const balanceValue = dataAsArray?.[0] as bigint | undefined;
  return { balance: fromWei(balanceValue), isLoading };
}

// 🔹 Лобби & Приглашения
export function publishGameToLobby(game: any) {
  if (typeof window === 'undefined') return;
  const list = JSON.parse(localStorage.getItem('c4c_lobby') || '[]');
  if (!list.find((g:any)=>g.id===game.id)) { 
    game.balance = game.stake; 
    game.status = 'waiting'; 
    list.push(game); 
    localStorage.setItem('c4c_lobby', JSON.stringify(list)); 
  }
}
export function getLobbyGames() { 
  return typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('c4c_lobby') || '[]') : []; 
}
export function generateGameInvite(id: string, name: string, stake: number, time: number) {
  const base = typeof window !== 'undefined' ? window.location.origin : '';
  const t = time >= 3600 ? `${time/3600}ч` : `${time/60}м`;
  return { 
    link: `${base}/?join=${id}`, 
    text: `♟️ ${name} приглашает в игру на ${stake.toLocaleString()} C4C!\n⏱️ Время: ${t}\n🔗 ${base}/?join=${id}` 
  };
}

// 🔹 Шахматные часы
export interface GameClock { 
  white: number; black: number; turn: 'w' | 'b'; active: boolean; finished: boolean; winner: 'w' | 'b' | null; 
}
export function initClock(seconds: number): GameClock { 
  return { white: seconds, black: seconds, turn: 'w', active: true, finished: false, winner: null }; 
}
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

export const PATCH_023 = { 
  TIME_CONTROLS, STAKE_LEVELS, MIN_STAKE, C4C_ADDR, GAME_ADDR, CHAIN_ID, DECIMALS, 
  C4C_ABI, GAME_ABI, toWei, fromWei, validateStake, formatPrizePool,
  useApproveC4C, useCreateGame, useJoinGame, useClaimWinnings, useGameBalance, 
  publishGameToLobby, getLobbyGames, generateGameInvite,
  initClock, tickClock, makeMove, formatClock 
};
