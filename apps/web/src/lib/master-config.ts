import { CONFIG_BASE } from './config-base';
import { PATCH_001 } from './config-patch-001';
import { PATCH_002 } from './config-patch-002';
import { PATCH_003 } from './config-patch-003';
import { PATCH_004 } from './config-patch-004';
import { PATCH_005 } from './config-patch-005';
import { PATCH_006 } from './config-patch-006';
import { PATCH_007 } from './config-patch-007';
import { PATCH_008 } from './config-patch-008';
import { PATCH_009 } from './config-patch-009';

export const CONFIG = {
  ...CONFIG_BASE,
  ...PATCH_001, ...PATCH_002, ...PATCH_003, ...PATCH_004,
  ...PATCH_005, ...PATCH_006, ...PATCH_007, ...PATCH_008, ...PATCH_009
};

// 🔹 Экспорт всех деталей для page.tsx
export const C4C_TOKEN_ADDRESS = CONFIG.C4C_TOKEN_ADDRESS;
export const GAME_CONTRACT_ADDRESS = CONFIG.GAME_CONTRACT_ADDRESS;
export const C4C_BUY_URL = CONFIG.C4C_BUY_URL;
export const CHAIN_ID = CONFIG.CHAIN_ID;
export const APP_NAME = CONFIG.APP_NAME;
export const APP_DESCRIPTION = CONFIG.APP_DESCRIPTION;
export const WALLETCONNECT_PROJECT_ID = CONFIG.WALLETCONNECT_PROJECT_ID;
export const TIME_OPTIONS = CONFIG.TIME_OPTIONS;
export const STAKE_OPTIONS = CONFIG.STAKE_OPTIONS;
export const CLASSIC_THEMES = CONFIG.CLASSIC_THEMES;
export const LANGUAGES = CONFIG.LANGUAGES;
export const t = CONFIG.t;
export const formatTime = CONFIG.formatTime;
export const formatC4C = CONFIG.formatC4C;
export const getBotMove = CONFIG.getBotMove;
export const saveProfileToStorage = CONFIG.saveProfileToStorage;
export const loadProfileFromStorage = CONFIG.loadProfileFromStorage;
export const createWagmiConfig = CONFIG.createWagmiConfig;
export const canConnectToMetaMask = CONFIG.canConnectToMetaMask;
export const canConnectToWalletConnect = CONFIG.canConnectToWalletConnect;
export const resetConnectionStates = CONFIG.resetConnectionStates;
export const getOnlineGames = CONFIG.getOnlineGames;
export const createGameLobby = CONFIG.createGameLobby;
export const getFriends = CONFIG.getFriends;
export const addFriend = CONFIG.addFriend;
export const processPayout = CONFIG.processPayout;
export const FIXED_CSS = CONFIG.FIXED_CSS;
export const injectGlobalStyles = CONFIG.injectGlobalStyles;
export const SAFE_BOARD_THEMES = CONFIG.SAFE_BOARD_THEMES;
