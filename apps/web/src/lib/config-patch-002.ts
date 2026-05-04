// 🔹 ПАТЧ 2: Исправление форматирования баланса (BSC = 18 decimals)
export function formatC4CFixed(a: any): string {
  if (!a) return '0.00';
  // wagmi возвращает BigInt. Делим на 10^18 без потери точности
  const decimals = 18;
  const value = typeof a === 'bigint' ? a : BigInt(a);
  const factor = 10n ** BigInt(decimals);
  const whole = value / factor;
  const frac = value % factor;
  const fracStr = frac.toString().padStart(decimals, '0');
  return `${whole}.${fracStr.slice(0, 2)}`;
}
export const PATCH_002 = { formatC4C: formatC4CFixed };
