// apps/web/src/lib/config.ts

// 🪙 C4C Token (BSC)
export const C4C_TOKEN_ADDRESS = "0xaac20575371de01b4d10c4e7566d5453d72d56e7" as const;

// 🎮 Game Contract (BSC)
export const GAME_CONTRACT_ADDRESS = "0xCf5E5d01ADd5e2Ba62B2f6747E5CFC43e36D5005" as const;

// 💰 Параметры ставок (обычные числа, конвертируем в BigInt при использовании)
export const STAKE_CONFIG = { 
  MIN: 50000, 
  MAX: 1000000, 
  STEP: 50000 
} as const;

// 🔗 Сеть
export const BSC_CHAIN_ID = 56;

// 🌐 Backend
export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://your-render-app.onrender.com";