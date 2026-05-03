// 🔹 ПАТЧ 12: Интеграция с РАЗВЕРНУТЫМИ контрактами (BSC) — wagmi v2 compatible
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';

// 🔹 ABI C4C Token (BEP20)
export const C4C_ABI = [
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function allowance(address owner, address spender) external view returns (uint256)',
  'function balanceOf(address account) external view returns (uint256)',
  'function decimals() external view returns (uint8)'
] as const;

// 🔹 ABI Game Contract (соответствует твоей логике)
export const GAME_ABI = [
  'function createGame(uint256 timeControl, uint256 stake) external',
  'function joinGame(uint256 gameId) external',
  'function recordMove(uint256 gameId, string calldata moveSan) external',
  'function claimWinnings(uint256 gameId) external',
  'function refundGame(uint256 gameId) external',
  'function settleDraw(uint256 gameId) external',
  'function getGame(uint256 gameId) external view returns (address creator, address opponent, uint256 stake, uint256 timeControl, uint8 status, uint256 createdAt)'
] as const;

export const C4C_TOKEN_ADDRESS = '0xaac20575371de01b4d10c4e7566d5453d72d56e7' as `0x${string}`;
export const GAME_CONTRACT_ADDRESS = '0xCf5E5d01ADd5e2Ba62B2f6747E5CFC43e36D5005' as `0x${string}`;
export const CHAIN_ID = 56;

// 🔥 Конвертация: C4C (6 decimals) → контракт (18 decimals)
export function toContractUnits(amountC4C: number): bigint {
  return parseUnits(amountC4C.toString(), 6);
}

// 🔹 Хук: Аппрув токенов (wagmi v2: data = txHash)
export function useApproveC4C() {
  const { writeContract, data: txHash, isPending, isSuccess, isError, error, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: txHash });
  
  const approve = async (stake: number) => writeContract({
    address: C4C_TOKEN_ADDRESS,
    abi: C4C_ABI,
    functionName: 'approve',
    args: [GAME_CONTRACT_ADDRESS, toContractUnits(stake)],
    chainId: CHAIN_ID
  });
  
  return { approve, txHash, isPending, isConfirming, isSuccess: isConfirmed, isError, error, reset };
}

// 🔹 Хук: Создать игру + Депозит
export function useCreateGame() {
  const { writeContract, data: txHash, isPending, isSuccess, isError, error, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: txHash });
  
  const create = async (timeControl: number, stake: number) => writeContract({
    address: GAME_CONTRACT_ADDRESS,
    abi: GAME_ABI,
    functionName: 'createGame',
    args: [BigInt(timeControl), toContractUnits(stake)],
    chainId: CHAIN_ID
  });
  
  return { create, txHash, isPending, isConfirming, isSuccess: isConfirmed, isError, error, reset };
}

// 🔹 Хук: Присоединиться + Депозит
export function useJoinGame() {
  const { writeContract, data: txHash, isPending, isSuccess, isError, error, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: txHash });
  
  const join = async (gameId: string) => {
    // Парсим числовой ID из строкового формата 'g_123456_abc'
    const numericId = gameId.replace('g_', '').split('_')[0];
    return writeContract({
      address: GAME_CONTRACT_ADDRESS,
      abi: GAME_ABI,
      functionName: 'joinGame',
      args: [BigInt(numericId)],
      chainId: CHAIN_ID
    });
  };
  
  return { join, txHash, isPending, isConfirming, isSuccess: isConfirmed, isError, error, reset };
}

// 🔹 Хук: Забрать выигрыш (весь пул)
export function useClaimWinnings() {
  const { writeContract, data: txHash, isPending, isSuccess, isError, error, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: txHash });
  
  const claim = async (gameId: string) => {
    const numericId = gameId.replace('g_', '').split('_')[0];
    return writeContract({
      address: GAME_CONTRACT_ADDRESS,
      abi: GAME_ABI,
      functionName: 'claimWinnings',
      args: [BigInt(numericId)],
      chainId: CHAIN_ID
    });
  };
  
  return { claim, txHash, isPending, isConfirming, isSuccess: isConfirmed, isError, error, reset };
}

// 🔹 Хук: Возврат создателю (таймаут 24ч)
export function useRefundCreator() {
  const { writeContract, data: txHash, isPending, isSuccess, isError, error, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: txHash });
  
  const refund = async (gameId: string) => {
    const numericId = gameId.replace('g_', '').split('_')[0];
    return writeContract({
      address: GAME_CONTRACT_ADDRESS,
      abi: GAME_ABI,
      functionName: 'refundGame',
      args: [BigInt(numericId)],
      chainId: CHAIN_ID
    });
  };
  
  return { refund, txHash, isPending, isConfirming, isSuccess: isConfirmed, isError, error, reset };
}

// 🔹 Хук: Ничья (возврат обоим)
export function useSettleDraw() {
  const { writeContract, data: txHash, isPending, isSuccess, isError, error, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: txHash });
  
  const settle = async (gameId: string) => {
    const numericId = gameId.replace('g_', '').split('_')[0];
    return writeContract({
      address: GAME_CONTRACT_ADDRESS,
      abi: GAME_ABI,
      functionName: 'settleDraw',
      args: [BigInt(numericId)],
      chainId: CHAIN_ID
    });
  };
  
  return { settle, txHash, isPending, isConfirming, isSuccess: isConfirmed, isError, error, reset };
}

export const PATCH_012 = {
  C4C_ABI, GAME_ABI, C4C_TOKEN_ADDRESS, GAME_CONTRACT_ADDRESS, CHAIN_ID,
  toContractUnits,
  useApproveC4C, useCreateGame, useJoinGame, useClaimWinnings, useRefundCreator, useSettleDraw
};
