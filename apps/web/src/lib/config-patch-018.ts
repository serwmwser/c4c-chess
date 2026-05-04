import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseUnits } from 'viem';

export const TIME_OPTIONS = [
  { label: '5 мин', value: 300 }, { label: '15 мин', value: 900 }, { label: '30 мин', value: 1800 },
  { label: '1 час', value: 3600 }, { label: '3 часа', value: 10800 }, { label: '24 часа', value: 86400 }
] as const;

export const STAKE_OPTIONS = [5000, 10000, 25000, 50000, 100000, 250000, 500000, 1000000] as const;
export const C4C_TOKEN = '0xaac20575371de01b4d10c4e7566d5453d72d56e7' as `0x${string}`;
export const GAME_CONTRACT = '0xCf5E5d01ADd5e2Ba62B2f6747E5CFC43e36D5005' as `0x${string}`;
export const CHAIN_ID = 56; export const DECIMALS = 6;

export const C4C_ABI = ['function approve(address spender, uint256 amount) external returns (bool)'] as const;
export const GAME_ABI = [
  'function createGame(uint256 timeControl, uint256 stake) external',
  'function joinGame(uint256 gameId) external',
  'function claimWinnings(uint256 gameId) external',
  'function getGame(uint256 gameId) external view returns (address creator, address opponent, uint256 stake, uint256 timeControl, uint8 status, uint256 balance)'
] as const;

export function toWei(n: number): bigint { return parseUnits(n.toString(), DECIMALS); }
export function fromWei(b: bigint): string { return (Number(b) / 10**DECIMALS).toLocaleString() + ' C4C'; }

// 🔹 wagmi v2 Hooks
export function useApprove() {
  const { writeContract, data: h, isPending, isSuccess } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash: h as `0x${string}` });
  return { exec: (s: number) => writeContract({ address: C4C_TOKEN, abi: C4C_ABI, functionName: 'approve', args: [GAME_CONTRACT, toWei(s)], chainId: CHAIN_ID }), h, isPending, isConfirming, isSuccess };
}
export function useCreateGame() {
  const { writeContract, data: h, isPending, isSuccess } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash: h as `0x${string}` });
  return { exec: (t: number, s: number) => writeContract({ address: GAME_CONTRACT, abi: GAME_ABI, functionName: 'createGame', args: [BigInt(t), toWei(s)], chainId: CHAIN_ID }), h, isPending, isConfirming, isSuccess };
}
export function useJoinGame() {
  const { writeContract, data: h, isPending, isSuccess } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash: h as `0x${string}` });
  return { exec: (id: string) => writeContract({ address: GAME_CONTRACT, abi: GAME_ABI, functionName: 'joinGame', args: [BigInt(id.replace('g_','').split('_')[0])], chainId: CHAIN_ID }), h, isPending, isConfirming, isSuccess };
}
export function useClaim() {
  const { writeContract, data: h, isPending, isSuccess } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash: h as `0x${string}` });
  return { exec: (id: string) => writeContract({ address: GAME_CONTRACT, abi: GAME_ABI, functionName: 'claimWinnings', args: [BigInt(id.replace('g_','').split('_')[0])], chainId: CHAIN_ID }), h, isPending, isConfirming, isSuccess };
}
export function useGameBalance(id: string | null) {
  const { data, isLoading } = useReadContract({
    address: GAME_CONTRACT, abi: GAME_ABI, functionName: 'getGame',
    args: id ? [BigInt(id.replace('g_','').split('_')[0])] : undefined, chainId: CHAIN_ID, query: { enabled: !!id }
  });
  return { balance: data?.[5] ? fromWei(data[5] as bigint) : '0 C4C', isLoading };
}

// 🔹 Утилиты
export function publishGame(g: any) {
  const list = JSON.parse(localStorage.getItem('c4c_games') || '[]');
  if (!list.find((x:any)=>x.id===g.id)) { g.balance = g.stake; list.push(g); localStorage.setItem('c4c_games', JSON.stringify(list)); }
}
export function getGames() { return JSON.parse(localStorage.getItem('c4c_games') || '[]'); }
export function generateInvite(id: string, name: string, stake: number, time: number) {
  const base = typeof window !== 'undefined' ? window.location.origin : '';
  const t = time >= 3600 ? `${time/3600}ч` : `${time/60}м`;
  return { link: `${base}/?join=${id}`, text: `♟️ ${name} приглашает на ${stake.toLocaleString()} C4C (${t})!\n🔗 ${base}/?join=${id}` };
}

export const PATCH_018 = { TIME_OPTIONS, STAKE_OPTIONS, C4C_TOKEN, GAME_CONTRACT, CHAIN_ID, DECIMALS, C4C_ABI, GAME_ABI, toWei, fromWei, validateStake, useApprove, useCreateGame, useJoinGame, useClaim, useGameBalance, publishGame, getGames, generateInvite };
