// apps/web/src/lib/config.ts

// 🔗 Адреса контрактов (BSC Mainnet)
export const C4C_TOKEN_ADDRESS = '0xaac20575371de01b4d10c4e7566d5453d72d56e7' as const;
export const GAME_CONTRACT_ADDRESS = '0xCf5E5d01ADd5e2Ba62B2f6747E5CFC43e36D5005' as const;

// 🌐 Настройки сети
export const CHAIN_ID = 56 as const;
export const CHAIN_NAME = 'Binance Smart Chain' as const;
export const RPC_URL = 'https://bsc-dataseed.binance.org/' as const;

// 🔑 WalletConnect Project ID
// 🔥 Для продакшена: замени 'demo' на реальный 32-символьный ключ из cloud.walletconnect.com
export const WALLETCONNECT_PROJECT_ID = 
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_WALLETCONNECT_ID) || '286f8aa9e630099f05763481672dcdc5';

// 🎮 Приложение
export const APP_NAME = 'C4C Chess' as const;
export const APP_DESCRIPTION = 'Play chess, earn C4C tokens on BSC' as const;

// ⚙️ Настройки игры (для будущих форм)
export const STAKE_MIN = 50000 as const;      // 0.05 C4C (6 децималей)
export const STAKE_MAX = 1000000 as const;    // 1 C4C
export const STAKE_STEP = 50000 as const;     // шаг 0.05
export const TIME_OPTIONS = [300, 600, 900] as const; // 5, 10, 15 минут

// 🔐 Флаги
export const IS_PRODUCTION = typeof process !== 'undefined' && process.env.NODE_ENV === 'production';

// 📦 Экспортируем всё одним объектом для удобства импорта
export const CONFIG = {
  C4C_TOKEN_ADDRESS,
  GAME_CONTRACT_ADDRESS,
  CHAIN_ID,
  CHAIN_NAME,
  RPC_URL,
  WALLETCONNECT_PROJECT_ID,
  APP_NAME,
  APP_DESCRIPTION,
  STAKE_MIN,
  STAKE_MAX,
  STAKE_STEP,
  TIME_OPTIONS,
  IS_PRODUCTION,
} as const;