import { CONFIG_BASE } from './config-base';
import { PATCH_026 } from './config-patch-026';

export const CONFIG = {
  ...CONFIG_BASE,
  ...PATCH_026
};

// 🔹 БАЗА
export const APP_NAME = CONFIG.APP_NAME;
export const C4C_TOKEN_ADDRESS = CONFIG.C4C_ADDR;
export const GAME_CONTRACT_ADDRESS = CONFIG.GAME_ADDR;
export const CHAIN_ID = CONFIG.CHAIN_ID;
export const C4C_BUY_URL = CONFIG.C4C_BUY_URL;

// 🔹 ОПЦИИ
export const TIME_CONTROLS = CONFIG.TIME_CONTROLS;
export const STAKE_LEVELS = CONFIG.STAKE_LEVELS;
export const MIN_STAKE = CONFIG.MIN_STAKE;
export const formatTime = CONFIG.formatTime;
export const formatC4C = CONFIG.fromWei;
export const formatPrizePool = CONFIG.formatPrizePool;
export const validateStake = CONFIG.validateStake;

// 🔹 КОНТРАКТЫ
export const C4C_ABI = CONFIG.C4C_ABI;
export const GAME_ABI = CONFIG.GAME_ABI;
export const toWei = CONFIG.toWei;
export const fromWei = CONFIG.fromWei;

// 🔹 ХУКИ
export const useApproveC4C = CONFIG.useApproveC4C;
export const useCreateGame = CONFIG.useCreateGame;
export const useJoinGame = CONFIG.useJoinGame;
export const useClaimWinnings = CONFIG.useClaimWinnings;
export const useGameBalance = CONFIG.useGameBalance;

// 🔹 ЛОББИ
export const publishGameToLobby = CONFIG.publishGameToLobby;
export const getLobbyGames = CONFIG.getLobbyGames;
export const generateGameInvite = CONFIG.generateGameInvite;
export const sendInviteToChat = CONFIG.sendInviteToChat;
export const canJoinGame = CONFIG.canJoinGame;

// 🔹 ОПОВЕЩЕНИЯ (из патча 026)
export const createNotification = CONFIG.createNotification;
export const getNotifications = CONFIG.getNotifications;
export const markNotificationRead = CONFIG.markNotificationRead;
export const playStartSound = CONFIG.playStartSound;
export const showVisualAlert = CONFIG.showVisualAlert;
export const checkAndStartGame = CONFIG.checkAndStartGame;
export const updatePlayerPresence = CONFIG.updatePlayerPresence;
export const areBothPlayersOnline = CONFIG.areBothPlayersOnline;

// 🔹 ТИПЫ
export type { GameNotification } from './config-patch-026';
