// 🔹 ПАТЧ 016: Баланс игры, кнопка покупки, выплата победителю — wagmi v2 compatible
import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseUnits } from 'viem';

// 🔹 Константы
export const C4C_TOKEN_ADDRESS = '0xaac20575371de01b4d10c4e7566d5453d72d56e7' as `0x${string}`;
export const GAME_CONTRACT_ADDRESS = '0xCf5E5d01ADd5e2Ba62B2f6747E5CFC43e36D5005' as `0x${string}`;
export const C4C_BUY_URL = 'https://www.pink.meme/token/bsc/0xaac20575371de01b4d10c4e7566d5453d72d56e7';
export const CHAIN_ID = 56;
export const C4C_DECIMALS = 6;

// 🔹 ABI (минимальный)
export const C4C_ABI = ['function approve(address spender, uint256 amount) external returns (bool)','function allowance(address owner, address spender) external view returns (uint256)','function balanceOf(address account) external view returns (uint256)'] as const;
export const GAME_ABI = [
  'function createGame(uint256 timeControl, uint256 stake) external',
  'function joinGame(uint256 gameId) external',
  'function claimWinnings(uint256 gameId) external',
  'function getGame(uint256 gameId) external view returns (address creator, address opponent, uint256 stake, uint256 timeControl, uint8 status, uint256 createdAt, uint256 balance)'
] as const;

// 🔹 Конвертация
export function toContractUnits(amountC4C: number): bigint { return parseUnits(amountC4C.toString(), C4C_DECIMALS); }
export function fromContractUnits(amount: bigint): number { return Number(amount) / Math.pow(10, C4C_DECIMALS); }

// 🔹 Хук: Аппрув токенов (wagmi v2: data = txHash)
export function useApproveC4C() {
  const { writeContract,  data: txHash, isPending, isSuccess, isError, error, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: txHash as `0x${string}` });
  const approve = (stake: number) => writeContract({ address: C4C_TOKEN_ADDRESS, abi: C4C_ABI, functionName: 'approve', args: [GAME_CONTRACT_ADDRESS, toContractUnits(stake)], chainId: CHAIN_ID });
  return { approve, txHash, isPending, isConfirming, isSuccess: isConfirmed, isError, error, reset };
}

// 🔹 Хук: Создать игру + депозит в баланс игры
export function useCreateTokenGame() {
  const { writeContract,  data: txHash, isPending, isSuccess, isError, error, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: txHash as `0x${string}` });
  const create = async (timeControl: number, stake: number) => writeContract({ address: GAME_CONTRACT_ADDRESS, abi: GAME_ABI, functionName: 'createGame', args: [BigInt(timeControl), toContractUnits(stake)], chainId: CHAIN_ID });
  return { create, txHash, isPending, isConfirming, isSuccess: isConfirmed, isError, error, reset };
}

// 🔹 Хук: Присоединиться + депозит в баланс игры
export function useJoinTokenGame() {
  const { writeContract,  data: txHash, isPending, isSuccess, isError, error, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: txHash as `0x${string}` });
  const join = async (gameId: string) => { const id = BigInt(gameId.replace('g_','').split('_')[0]); return writeContract({ address: GAME_CONTRACT_ADDRESS, abi: GAME_ABI, functionName: 'joinGame', args: [id], chainId: CHAIN_ID }); };
  return { join, txHash, isPending, isConfirming, isSuccess: isConfirmed, isError, error, reset };
}

// 🔹 Хук: Забрать выигрыш (весь баланс игры)
export function useClaimWinnings() {
  const { writeContract,  data: txHash, isPending, isSuccess, isError, error, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: txHash as `0x${string}` });
  const claim = async (gameId: string) => { const id = BigInt(gameId.replace('g_','').split('_')[0]); return writeContract({ address: GAME_CONTRACT_ADDRESS, abi: GAME_ABI, functionName: 'claimWinnings', args: [id], chainId: CHAIN_ID }); };
  return { claim, txHash, isPending, isConfirming, isSuccess: isConfirmed, isError, error, reset };
}

// 🔹 Хук: Чтение баланса игры из контракта
export function useGameBalance(gameId: string | null) {
  const {  data, isLoading, refetch } = useReadContract({
    address: GAME_CONTRACT_ADDRESS,
    abi: GAME_ABI,
    functionName: 'getGame',
    args: gameId ? [BigInt(gameId.replace('g_','').split('_')[0])] : undefined,
    chainId: CHAIN_ID,
    query: { enabled: !!gameId }
  });
  const dataAsArray = data as any;
  const balance = dataAsArray?.[6] ? fromContractUnits(dataAsArray[6] as bigint) : 0;
  return { balance, isLoading, refetch };
}

// 🔹 Генерация приглашения
export function generateGameInvite(gameId: string, creatorName: string, stake: number, timeCtrl: number) {
  const base = typeof window !== 'undefined' ? window.location.origin : 'https://c4c-chess.vercel.app';
  const link = `${base}/?join=${gameId}`;
  const t = timeCtrl >= 3600 ? `${timeCtrl/3600}ч` : `${timeCtrl/60}м`;
  return { link, text: `♟️ ${creatorName} приглашает в игру на ${stake.toLocaleString()} C4C!\n⏱️ ${t}\n🔗 ${link}`, copy: `🎮 ${stake.toLocaleString()} C4C — ${t}\n🔗 ${link}` };
}

// 🔹 Отправка в чат (локально)
export function sendInviteToChat(friendAddr: string, invite: { text: string, link: string }) {
  if (typeof window === 'undefined') return;
  const chats = JSON.parse(localStorage.getItem('c4c-chats') || '{}');
  const key = friendAddr.toLowerCase();
  if (!chats[key]) chats[key] = [];
  chats[key].push({ id: `inv_${Date.now()}`, text: invite.text, link: invite.link, sender: 'system', timestamp: Date.now(), type: 'invite' });
  localStorage.setItem('c4c-chats', JSON.stringify(chats));
}

// 🔹 Публикация игры в лобби с балансом
export function publishGameToLobby(game: any) {
  if (typeof window === 'undefined') return;
  const games = JSON.parse(localStorage.getItem('c4c-active-games') || '[]');
  if (!games.find((g:any)=>g.id===game.id)) { 
    game.balance = game.stake;
    games.push(game); 
    localStorage.setItem('c4c-active-games', JSON.stringify(games)); 
  }
}

// 🔹 Обновление баланса игры в лобби
export function updateGameBalance(gameId: string, newBalance: number) {
  if (typeof window === 'undefined') return;
  const games = JSON.parse(localStorage.getItem('c4c-active-games') || '[]');
  const idx = games.findIndex((g:any)=>g.id===gameId);
  if (idx !== -1) { games[idx].balance = newBalance; localStorage.setItem('c4c-active-games', JSON.stringify(games)); }
}

export const PATCH_016 = {
  C4C_TOKEN_ADDRESS, GAME_CONTRACT_ADDRESS, C4C_BUY_URL, CHAIN_ID, C4C_DECIMALS,
  C4C_ABI, GAME_ABI, toContractUnits, fromContractUnits,
  useApproveC4C, useCreateTokenGame, useJoinTokenGame, useClaimWinnings, useGameBalance,
  generateGameInvite, sendInviteToChat, publishGameToLobby, updateGameBalance
};
