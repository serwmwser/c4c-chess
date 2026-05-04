import { CONFIG_BASE } from './config-base';
import { PATCH_001 } from './config-patch-001'; import { PATCH_002 } from './config-patch-002'; import { PATCH_003 } from './config-patch-003'; import { PATCH_004 } from './config-patch-004'; import { PATCH_005 } from './config-patch-005'; import { PATCH_006 } from './config-patch-006'; import { PATCH_007 } from './config-patch-007'; import { PATCH_008 } from './config-patch-008'; import { PATCH_009 } from './config-patch-009'; import { PATCH_010 } from './config-patch-010'; import { PATCH_011 } from './config-patch-011'; import { PATCH_014 } from './config-patch-014'; import { PATCH_015 } from './config-patch-015'; import { PATCH_016 } from './config-patch-016'; import { PATCH_017 } from './config-patch-017'; import { PATCH_018 } from './config-patch-018'; import { PATCH_019 } from './config-patch-019'; import { PATCH_020 } from './config-patch-020'; import { PATCH_021 } from './config-patch-021'; import { PATCH_022 } from './config-patch-022';

export const CONFIG = {
  ...CONFIG_BASE,
  ...PATCH_001, ...PATCH_002, ...PATCH_003, ...PATCH_004,
  ...PATCH_005, ...PATCH_006, ...PATCH_007, ...PATCH_008, ...PATCH_009,
  ...PATCH_010, ...PATCH_011, ...PATCH_014, ...PATCH_015, ...PATCH_016,
  ...PATCH_017, ...PATCH_018, ...PATCH_019, ...PATCH_020, ...PATCH_021, ...PATCH_022
};

// 🔹 ЯВНЫЕ ЭКСПОРТЫ (используем функции из Патча 022)
export const APP_NAME = CONFIG.APP_NAME;
export const C4C_TOKEN_ADDRESS = CONFIG.C4C_TOKEN_ADDRESS || CONFIG.C4C_ADDR;
export const GAME_CONTRACT_ADDRESS = CONFIG.GAME_CONTRACT_ADDRESS || CONFIG.GAME_ADDR;
export const CHAIN_ID = CONFIG.CHAIN_ID;
export const C4C_BUY_URL = CONFIG.C4C_BUY_URL;
export const TIME_OPTIONS = CONFIG.TIME_CONTROLS || CONFIG.TIME_OPTIONS;
export const STAKE_OPTIONS = CONFIG.STAKE_LEVELS; // 🔥 Используем новый массив
export const MIN_STAKE = CONFIG.MIN_STAKE;
export const formatTime = CONFIG.formatTime || CONFIG.formatClock;
export const formatC4C = CONFIG.formatC4C || CONFIG.fromWei;
export const formatPrizePool = CONFIG.formatPrizePool;
export const validateStake = CONFIG.validateStake;
export const getBotMove = CONFIG.getBotMove;
export const saveProfileToStorage = CONFIG.saveProfileToStorage;
export const loadProfileFromStorage = CONFIG.loadProfileFromStorage;
export const createWagmiConfig = CONFIG.createWagmiConfig;
export const canConnectToMetaMask = CONFIG.canConnectToMetaMask;
export const canConnectToWalletConnect = CONFIG.canConnectToWalletConnect;
export const resetConnectionStates = CONFIG.resetConnectionStates;
export const FIXED_CSS = CONFIG.FIXED_CSS;
export const injectGlobalStyles = CONFIG.injectGlobalStyles;
export const getFriends = CONFIG.getFriends;
export const addFriend = CONFIG.addFriend;
export const processPayout = CONFIG.processPayout;
export const getOnlineGames = CONFIG.getOnlineGames || CONFIG.getLobbyGames;
export const UI_THEMES = CONFIG.UI_THEMES || CONFIG.CLASSIC_THEMES;
export const UI_LANGS = CONFIG.UI_LANGS || CONFIG.LANGUAGES;
export const UI_BOARDS = CONFIG.UI_BOARDS || CONFIG.SAFE_BOARD_THEMES;
export const UI_TRANSLATE = CONFIG.UI_TRANSLATE || CONFIG.t;

export const C4C_ABI = CONFIG.C4C_ABI; export const GAME_ABI = CONFIG.GAME_ABI;
export const toContractUnits = CONFIG.toContractUnits || CONFIG.toWei;
export const useApproveC4C = CONFIG.useApproveC4C;
export const useCreateTokenGame = CONFIG.useCreateTokenGame || CONFIG.useCreateGame;
export const useJoinTokenGame = CONFIG.useJoinTokenGame || CONFIG.useJoinGame;
export const useClaimWinnings = CONFIG.useClaimWinnings || CONFIG.useClaim;
export const useGameBalance = CONFIG.useGameBalance; // 🔥 Новый хук из Патча 022

export const createTokenGameSession = CONFIG.createTokenGameSession;
export const publishGameToLobby = CONFIG.publishGameToLobby;
export const getLobbyGames = CONFIG.getLobbyGames;
export const generateGameInvite = CONFIG.generateGameInvite;
export const sendInviteToChat = CONFIG.sendInviteToChat;
export const canJoinGame = CONFIG.canJoinGame || (async () => ({ canJoin: true }));

export const initClock = CONFIG.initClock;
export const tickClock = CONFIG.tickClock;
export const makeMove = CONFIG.makeMove;
export const formatClock = CONFIG.formatClock;
