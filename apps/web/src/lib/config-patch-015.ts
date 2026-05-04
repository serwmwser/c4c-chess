// 🔹 ПАТЧ 015: Точные суммы ставок и расчет призового фонда (2×)
export const ALLOWED_STAKES = [5000, 10000, 25000, 50000, 100000, 200000, 250000, 500000, 750000, 1000000] as const;
export type AllowedStake = typeof ALLOWED_STAKES[number];
export const MIN_STAKE = 5000;

export function validateExactStake(stake: number): { valid: boolean; error?: string } {
  if (!ALLOWED_STAKES.includes(stake as AllowedStake)) {
    return { valid: false, error: `Выберите сумму из списка: ${ALLOWED_STAKES.map(s => s.toLocaleString()).join(', ')}` };
  }
  return { valid: true };
}

export function calculatePrizePool(stake: number): number {
  return stake * 2;
}

export function formatPrizePool(stake: number): string {
  return `${calculatePrizePool(stake).toLocaleString()} C4C`;
}

export const PATCH_015 = { ALLOWED_STAKES, MIN_STAKE, validateExactStake, calculatePrizePool, formatPrizePool };
