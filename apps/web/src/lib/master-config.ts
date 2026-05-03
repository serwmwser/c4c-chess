import { CONFIG_BASE } from './config-base';
import { PATCH_001 } from './config-patch-001';
import { PATCH_002 } from './config-patch-002';
import { PATCH_003 } from './config-patch-003';
import { PATCH_004 } from './config-patch-004';
import { PATCH_005 } from './config-patch-005';
import { PATCH_006 } from './config-patch-006';

// 🔹 КОНСТРУКТОР: Собираем всё в один объект CONFIG
export const CONFIG = {
  ...CONFIG_BASE,
  ...PATCH_001,
  ...PATCH_002,
  ...PATCH_003,
  ...PATCH_004,
  ...PATCH_005,
  ...PATCH_006,
};

// 🔹 ЭКСПОРТ: Отдаем все детали приложению
export const C4C_TOKEN_ADDRESS = CONFIG.C4C_TOKEN_ADDRESS;
export const GAME_CONTRACT_ADDRESS = CONFIG.GAME_CONTRACT_ADDRESS;
export const C4C_BUY_URL = CONFIG.C4C_BUY_URL;
export const CHAIN_ID = CONFIG.CHAIN_ID;
export const CHAIN_NAME = CONFIG.CHAIN_NAME;
export const RPC_URL = CONFIG.RPC_URL;
export const APP_NAME = CONFIG.APP_NAME;
export const APP_DESCRIPTION = CONFIG.APP_DESCRIPTION;
export const WALLETCONNECT_PROJECT_ID = CONFIG.WALLETCONNECT_PROJECT_ID;
export const HOW_TO_PLAY = CONFIG.HOW_TO_PLAY;
export const LANGUAGES = CONFIG.LANGUAGES;
export const TIME_OPTIONS = CONFIG.TIME_OPTIONS;
export const STAKE_OPTIONS = CONFIG.STAKE_OPTIONS;
export const BOARD_THEMES = CONFIG.BOARD_THEMES;
export const PROFILE_THEMES = CONFIG.PROFILE_THEMES;
export const BRIGHT_PROFILE_THEMES = CONFIG.BRIGHT_PROFILE_THEMES;
export const CHESS_COM_BOARD_THEMES = CONFIG.CHESS_COM_BOARD_THEMES;
export const formatTime = CONFIG.formatTime;
export const formatC4C = CONFIG.formatC4C;
export const getBotMove = CONFIG.getBotMove;
export const getBoardThemeForProfile = CONFIG.getBoardThemeForProfile;
export const saveProfileToStorage = CONFIG.saveProfileToStorage;
export const loadProfileFromStorage = CONFIG.loadProfileFromStorage;
export const createWagmiConfig = CONFIG.createWagmiConfig;
export const canConnectToMetaMask = CONFIG.canConnectToMetaMask;
export const canConnectToWalletConnect = CONFIG.canConnectToWalletConnect;
export const resetConnectionStates = CONFIG.resetConnectionStates;
export const getPieceStyle = CONFIG.getPieceStyle;
export const PIECE_SYMBOLS = CONFIG.PIECE_SYMBOLS;
export const getOnlineGames = CONFIG.getOnlineGames;
export const createGameLobby = CONFIG.createGameLobby;
export const getFriends = CONFIG.getFriends;
export const addFriend = CONFIG.addFriend;
export const sendGameInvite = CONFIG.sendGameInvite;
export const processPayout = CONFIG.processPayout;
export const FIXED_CSS = CONFIG.FIXED_CSS;
export const injectGlobalStyles = CONFIG.injectGlobalStyles;
export const GLOBAL_THEME_STYLES = CONFIG.GLOBAL_THEME_STYLES;
export const applyThemeCoordinator = CONFIG.applyThemeCoordinator;
