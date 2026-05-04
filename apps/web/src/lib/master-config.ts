import { CONFIG_BASE } from './config-base';
import { PATCH_026 } from './config-patch-026';

export const CONFIG = { ...CONFIG_BASE, ...PATCH_026 };

// 🔹 БАЗА (с фоллбэками)
export const APP_NAME = CONFIG.APP_NAME;
export const C4C_TOKEN_ADDRESS = (CONFIG as any).C4C_ADDR || (CONFIG as any).C4C_TOKEN || (CONFIG as any).C4C_TOKEN_ADDRESS;
export const GAME_CONTRACT_ADDRESS = (CONFIG as any).GAME_ADDR || (CONFIG as any).GAME_CONTRACT || (CONFIG as any).GAME_CONTRACT_ADDRESS;
export const CHAIN_ID = CONFIG.CHAIN_ID;
export const C4C_BUY_URL = CONFIG.C4C_BUY_URL;
export const C4C_EXCHANGE_URL = (CONFIG as any).C4C_EXCHANGE_URL;
export const YOUTUBE_URL = (CONFIG as any).YOUTUBE_URL;
export const YOUTUBE_BUTTON_TEXT = (CONFIG as any).YOUTUBE_BUTTON_TEXT;
export const YOUTUBE_SECTION_DESCRIPTION = (CONFIG as any).YOUTUBE_SECTION_DESCRIPTION;
export const SOCIAL_SECTION_TITLE = (CONFIG as any).SOCIAL_SECTION_TITLE;
export const SOCIAL_LINKS = (CONFIG as any).SOCIAL_LINKS;
export const SECTIONS = (CONFIG as any).SECTIONS;

// 🔹 ОПЦИИ ИГРЫ
export const TIME_OPTIONS = CONFIG.TIME_CONTROLS || CONFIG.TIME_OPTIONS;
export const STAKE_OPTIONS = CONFIG.STAKE_LEVELS || CONFIG.ALLOWED_STAKES;
export const MIN_STAKE = CONFIG.MIN_STAKE;
export const TIME_CONTROLS = CONFIG.TIME_CONTROLS;
export const STAKE_LEVELS = CONFIG.STAKE_LEVELS;

// 🔹 ФОРМАТИРОВАНИЕ
export const formatTime = CONFIG.formatTime || CONFIG.formatClock;
export const formatC4C = CONFIG.formatC4C || CONFIG.fromWei;
export const formatPrizePool = CONFIG.formatPrizePool;
export const formatClock = CONFIG.formatClock || (CONFIG as any).formatClockExtended;

// 🔹 ВАЛИДАЦИЯ
export const validateStake = CONFIG.validateStake;
export const validateGameConfig = (CONFIG as any).validateGameConfig;

// 🔹 UI / ТЕМЫ / ЯЗЫКИ
export const UI_THEMES = CONFIG.UI_THEMES || (CONFIG as any).CLASSIC_THEMES;
export const UI_LANGS = CONFIG.UI_LANGS || (CONFIG as any).LANGUAGES;
export const UI_BOARDS = CONFIG.UI_BOARDS || (CONFIG as any).SAFE_BOARD_THEMES;
export const UI_TRANSLATE = CONFIG.UI_TRANSLATE || (CONFIG as any).t;
export const EXTENDED_BOARD_THEMES = (CONFIG as any).EXTENDED_BOARD_THEMES;
export const PIECE_STYLES = (CONFIG as any).PIECE_STYLES;

// 🔹 ПРОФИЛЬ / СОХРАНЕНИЕ
export const saveProfileToStorage = CONFIG.saveProfileToStorage;
export const loadProfileFromStorage = CONFIG.loadProfileFromStorage;
export const getFriends = CONFIG.getFriends;
export const addFriend = CONFIG.addFriend;

// 🔹 ПОДКЛЮЧЕНИЕ / WAGMI
export const createWagmiConfig = (CONFIG as any).createWagmiConfig;
export const canConnectToMetaMask = (CONFIG as any).canConnectToMetaMask;
export const canConnectToWalletConnect = (CONFIG as any).canConnectToWalletConnect;
export const resetConnectionStates = CONFIG.resetConnectionStates;

// 🔹 СТИЛИ / CSS
export const FIXED_CSS = CONFIG.FIXED_CSS;
export const injectGlobalStyles = CONFIG.injectGlobalStyles;

// 🔹 КОНТРАКТЫ / УТИЛИТЫ
export const C4C_ABI = CONFIG.C4C_ABI;
export const GAME_ABI = CONFIG.GAME_ABI;
export const toWei = CONFIG.toWei;
export const fromWei = CONFIG.fromWei;
export const toContractUnits = (CONFIG as any).toContractUnits || CONFIG.toWei;
export const fromContractUnits = (CONFIG as any).fromContractUnits || CONFIG.fromWei;

// 🔹 ХУКИ КОНТРАКТОВ
export const useApproveC4C = CONFIG.useApproveC4C;
export const useCreateTokenGame = (CONFIG as any).useCreateTokenGame || (CONFIG as any).useCreateGame;
export const useJoinTokenGame = (CONFIG as any).useJoinTokenGame || (CONFIG as any).useJoinGame;
export const useClaimWinnings = (CONFIG as any).useClaimWinnings || (CONFIG as any).useClaim;
export const useGameBalance = (CONFIG as any).useGameBalance || (CONFIG as any).useGameBalanceManager;
export const useGameBalanceManager = (CONFIG as any).useGameBalanceManager;

// 🔹 ИГРЫ / ЛОББИ
export const createTokenGameSession = (CONFIG as any).createTokenGameSession;
export const createGameWithStake = (CONFIG as any).createGameWithStake;
export const joinGameWithStake = (CONFIG as any).joinGameWithStake;
export const publishGameToLobby = CONFIG.publishGameToLobby || (CONFIG as any).publishGameToLobbyExtended;
export const publishGameToLobbyExtended = (CONFIG as any).publishGameToLobbyExtended;
export const getLobbyGames = CONFIG.getLobbyGames || (CONFIG as any).getLobbyGamesExtended;
export const getLobbyGamesExtended = (CONFIG as any).getLobbyGamesExtended;
export const generateGameInvite = CONFIG.generateGameInvite || (CONFIG as any).generateGameInviteExtended;
export const generateGameInviteExtended = (CONFIG as any).generateGameInviteExtended;
export const sendInviteToChat = CONFIG.sendInviteToChat || (CONFIG as any).sendInviteToChatExtended;
export const sendInviteToChatExtended = (CONFIG as any).sendInviteToChatExtended;
export const canJoinGame = CONFIG.canJoinGame || (CONFIG as any).canJoinGameExtended;
export const canJoinGameExtended = (CONFIG as any).canJoinGameExtended;
export const processPayout = CONFIG.processPayout;
export const getBotMove = CONFIG.getBotMove;

// 🔹 ШАХМАТНЫЕ ЧАСЫ
export const initClock = CONFIG.initClock || (CONFIG as any).initClockExtended;
export const initClockExtended = (CONFIG as any).initClockExtended;
export const tickClock = CONFIG.tickClock || (CONFIG as any).tickClockExtended;
export const tickClockExtended = (CONFIG as any).tickClockExtended;
export const makeMove = CONFIG.makeMove || (CONFIG as any).makeMoveExtended;
export const makeMoveExtended = (CONFIG as any).makeMoveExtended;
export const formatClockExtended = (CONFIG as any).formatClockExtended;
export const checkTimeWin = (CONFIG as any).checkTimeWin;
export const processTimeWin = (CONFIG as any).processTimeWin;

// 🔹 ОКНО БАЛАНСА ИГРЫ
export const GAME_BALANCE_WINDOW_TITLE = (CONFIG as any).GAME_BALANCE_WINDOW_TITLE;
export const GAME_BALANCE_JOIN_BUTTON = (CONFIG as any).GAME_BALANCE_JOIN_BUTTON;
export const GAME_BALANCE_CREATE_BUTTON = (CONFIG as any).GAME_BALANCE_CREATE_BUTTON;
export const GAME_BALANCE_INVITE_BUTTON = (CONFIG as any).GAME_BALANCE_INVITE_BUTTON;

// 🔹 ОПОВЕЩЕНИЯ
export const createNotification = (CONFIG as any).createNotification;
export const getNotifications = (CONFIG as any).getNotifications;
export const markNotificationRead = (CONFIG as any).markNotificationRead;
export const playStartSound = (CONFIG as any).playStartSound;
export const showVisualAlert = (CONFIG as any).showVisualAlert;
export const checkAndStartGame = (CONFIG as any).checkAndStartGame;
export const updatePlayerPresence = (CONFIG as any).updatePlayerPresence;
export const areBothPlayersOnline = (CONFIG as any).areBothPlayersOnline;

// 🔹 ТИПЫ
export type { GameNotification } from './config-patch-026';
