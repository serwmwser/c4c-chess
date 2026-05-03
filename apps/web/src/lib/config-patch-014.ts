// 🔹 ПАТЧ 14: Единый код для игр на токены — валидация, депозит, лобби, приглашения
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';

// 🔹 КОНСТАНТЫ
export const MIN_STAKE = 10000; // Мин. ставка: 10 000 C4C
export const C4C_DECIMALS = 6;
export const C4C_TOKEN_ADDRESS = '0xaac20575371de01b4d10c4e7566d5453d72d56e7' as `0x${string}`;
export const GAME_CONTRACT_ADDRESS = '0xCf5E5d01ADd5e2Ba62B2f6747E5CFC43e36D5005' as `0x${string}`;
export const CHAIN_ID = 56;

// 🔹 ABI (минимальный набор)
export const C4C_ABI = ['function approve(address spender, uint256 amount) external returns (bool)','function allowance(address owner, address spender) external view returns (uint256)','function balanceOf(address account) external view returns (uint256)'] as const;
export const GAME_ABI = ['function createGame(uint256 timeControl, uint256 stake) external','function joinGame(uint256 gameId) external','function claimWinnings(uint256 gameId) external','function refundGame(uint256 gameId) external','function settleDraw(uint256 gameId) external'] as const;

// 🔹 Конвертация в единицы контракта
export function toContractUnits(amountC4C: number): bigint { return parseUnits(amountC4C.toString(), C4C_DECIMALS); }

// 🔹 Валидация ставки
export function validateStake(stake: number): { valid: boolean; error?: string } {
  if (stake < MIN_STAKE) return { valid: false, error: `Мин. ставка: ${MIN_STAKE.toLocaleString()} C4C` };
  return { valid: true };
}

// 🔹 Хук: Аппрув токенов
export function useApproveC4C() {
  const { writeContract, data: txHash, isPending, isSuccess, isError, error, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: txHash as `0x${string}` });
  const approve = (stake: number) => writeContract({ address: C4C_TOKEN_ADDRESS, abi: C4C_ABI, functionName: 'approve', args: [GAME_CONTRACT_ADDRESS, toContractUnits(stake)], chainId: CHAIN_ID });
  return { approve, txHash, isPending, isConfirming, isSuccess: isConfirmed, isError, error, reset };
}

// 🔹 Хук: Создать игру + депозит (основной поток)
export function useCreateTokenGame() {
  const { writeContract, data: txHash, isPending, isSuccess, isError, error, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: txHash as `0x${string}` });
  const create = async (timeControl: number, stake: number) => {
    const v = validateStake(stake); if (!v.valid) throw new Error(v.error);
    return writeContract({ address: GAME_CONTRACT_ADDRESS, abi: GAME_ABI, functionName: 'createGame', args: [BigInt(timeControl), toContractUnits(stake)], chainId: CHAIN_ID });
  };
  return { create, txHash, isPending, isConfirming, isSuccess: isConfirmed, isError, error, reset };
}

// 🔹 Хук: Присоединиться к игре
export function useJoinTokenGame() {
  const { writeContract, data: txHash, isPending, isSuccess, isError, error, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: txHash as `0x${string}` });
  const join = async (gameId: string) => {
    const id = BigInt(gameId.replace('g_','').split('_')[0]);
    return writeContract({ address: GAME_CONTRACT_ADDRESS, abi: GAME_ABI, functionName: 'joinGame', args: [id], chainId: CHAIN_ID });
  };
  return { join, txHash, isPending, isConfirming, isSuccess: isConfirmed, isError, error, reset };
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

// 🔹 Публикация игры в лобби
export function publishGameToLobby(game: any) {
  if (typeof window === 'undefined') return;
  const games = JSON.parse(localStorage.getItem('c4c-active-games') || '[]');
  if (!games.find((g:any)=>g.id===game.id)) { games.push(game); localStorage.setItem('c4c-active-games', JSON.stringify(games)); }
}

// 🔹 Проверка: можно ли присоединиться
export async function canJoinGame(gameId: string, userAddr: string, stake: number) {
  if (typeof window === 'undefined') return { canJoin: false, reason: 'SSR' };
  const games = JSON.parse(localStorage.getItem('c4c-active-games')||'[]');
  const g = games.find((x:any)=>x.id===gameId);
  if (!g) return { canJoin: false, reason: 'Игра не найдена' };
  if (g.status !== 'waiting') return { canJoin: false, reason: 'Игра уже активна' };
  if (g.creator.toLowerCase() === userAddr.toLowerCase()) return { canJoin: false, reason: 'Вы создатель' };
  return { canJoin: true };
}

// 🔹 Экспорт всего в одном объекте
export const PATCH_014 = {
  MIN_STAKE, C4C_DECIMALS, C4C_TOKEN_ADDRESS, GAME_CONTRACT_ADDRESS, CHAIN_ID,
  C4C_ABI, GAME_ABI, toContractUnits, validateStake,
  useApproveC4C, useCreateTokenGame, useJoinTokenGame,
  generateGameInvite, sendInviteToChat, publishGameToLobby, canJoinGame
};
