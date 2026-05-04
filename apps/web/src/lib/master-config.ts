// 🔹 MASTER CONFIG (Очищенный и рабочий)
import { CONFIG_BASE } from './config-base';
import { PATCH_024 } from './config-patch-024';
import { PATCH_025 } from './config-patch-025';
import { PATCH_026 } from './config-patch-026';

// 🔹 Единый конфиг-объект (последний импорт перезаписывает дубли)
export const CONFIG = {
  ...CONFIG_BASE,
  ...PATCH_024,
  ...PATCH_025,
  ...PATCH_026
};

// 🔹 БАЗА / UI
export const APP_NAME = CONFIG.APP_NAME;
export const C4C_BUY_URL = CONFIG.C4C_BUY_URL;
export const UI_THEMES = CONFIG.UI_THEMES;
export const UI_LANGS = CONFIG.UI_LANGS;
export const UI_BOARDS = CONFIG.UI_BOARDS;
export const UI_TRANSLATE = CONFIG.UI_TRANSLATE;
export const FIXED_CSS = CONFIG.FIXED_CSS;
export const injectGlobalStyles = CONFIG.injectGlobalStyles;

// 🔹 ОПЦИИ ИГРЫ
export const TIME_OPTIONS = CONFIG.TIME_CONTROLS || CONFIG.TIME_OPTIONS;
export const STAKE_OPTIONS = CONFIG.STAKE_LEVELS || CONFIG.STAKE_OPTIONS;
export const validateStake = CONFIG.validateStake;
export const formatTime = CONFIG.formatTime;
export const formatC4C = CONFIG.formatC4C || CONFIG.fromWei;
export const formatPrizePool = CONFIG.formatPrizePool;
export const formatClock = CONFIG.formatClock;

// 🔹 ПРОФИЛЬ / СОХРАНЕНИЕ
export const saveProfileToStorage = CONFIG.saveProfileToStorage;
export const loadProfileFromStorage = CONFIG.loadProfileFromStorage;
export const resetConnectionStates = CONFIG.resetConnectionStates;
export const getBotMove = CONFIG.getBotMove;
export const processPayout = CONFIG.processPayout;

// 🔹 СОЦИАЛЬНЫЕ / ДРУЗЬЯ
export const getFriends = CONFIG.getFriends;
export const addFriend = CONFIG.addFriend;
export const YOUTUBE_URL = CONFIG.YOUTUBE_URL;
export const YOUTUBE_BUTTON_TEXT = CONFIG.YOUTUBE_BUTTON_TEXT;
export const SOCIAL_SECTION_TITLE = CONFIG.SOCIAL_SECTION_TITLE;
export const SOCIAL_LINKS = CONFIG.SOCIAL_LINKS;

// 🔹 ЛОББИ / ИГРЫ
export const publishGameToLobby = CONFIG.publishGameToLobby;
export const getLobbyGames = CONFIG.getLobbyGames;
export const generateGameInvite = CONFIG.generateGameInvite;
export const sendInviteToChat = CONFIG.sendInviteToChat;
export const canJoinGame = CONFIG.canJoinGame;

// 🔹 ШАХМАТНЫЕ ЧАСЫ
export const initClock = CONFIG.initClock;
export const tickClock = CONFIG.tickClock;
export const makeMove = CONFIG.makeMove;

// 🔹 ОПОВЕЩЕНИЯ / ОНЛАЙН
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

// 🔹 ДОПОЛНИТЕЛЬНЫЕ КОНСТАНТЫ (для ChessApp.tsx)
export const SECTIONS = CONFIG.SECTIONS;
export const C4C_EXCHANGE_URL = CONFIG.C4C_EXCHANGE_URL;
export const YOUTUBE_SECTION_DESCRIPTION = CONFIG.YOUTUBE_SECTION_DESCRIPTION;
export const EXTENDED_BOARD_THEMES = CONFIG.EXTENDED_BOARD_THEMES;
export const PIECE_STYLES = CONFIG.PIECE_STYLES;
export const GAME_BALANCE_WINDOW_TITLE = CONFIG.GAME_BALANCE_WINDOW_TITLE;
export const GAME_BALANCE_JOIN_BUTTON = CONFIG.GAME_BALANCE_JOIN_BUTTON;
export const GAME_BALANCE_CREATE_BUTTON = CONFIG.GAME_BALANCE_CREATE_BUTTON;
export const GAME_BALANCE_INVITE_BUTTON = CONFIG.GAME_BALANCE_INVITE_BUTTON;
export const TIME_OPTIONS = CONFIG.TIME_CONTROLS || CONFIG.TIME_OPTIONS;
export const STAKE_OPTIONS = CONFIG.STAKE_LEVELS || CONFIG.STAKE_OPTIONS;
