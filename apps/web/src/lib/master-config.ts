import { CONFIG_BASE } from './config-base';
// 🔹 АКТИВНЫЕ ПАТЧИ (только рабочие)
import { PATCH_024 } from './config-patch-024';

// 🔹 КОНСТРУКТОР: Только то, что нужно
export const CONFIG = {
  ...CONFIG_BASE,
  ...PATCH_024
};

// 🔹 ЯВНЫЕ ЭКСПОРТЫ (всё из PATCH_023)
export const APP_NAME = CONFIG.APP_NAME;
export const C4C_TOKEN_ADDRESS = CONFIG.C4C_ADDR;
export const GAME_CONTRACT_ADDRESS = CONFIG.GAME_ADDR;
export const CHAIN_ID = CONFIG.CHAIN_ID;
export const C4C_BUY_URL = CONFIG.C4C_BUY_URL || 'https://www.pink.meme/token/bsc/0xaac20575371de01b4d10c4e7566d5453d72d56e7';
export const TIME_OPTIONS = CONFIG.TIME_CONTROLS;
export const STAKE_OPTIONS = CONFIG.STAKE_LEVELS;
export const MIN_STAKE = CONFIG.MIN_STAKE;
export const formatTime = CONFIG.formatClock;
export const formatC4C = CONFIG.fromWei;
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
export const getOnlineGames = CONFIG.getLobbyGames;
export const UI_THEMES = CONFIG.UI_THEMES;
export const UI_LANGS = CONFIG.UI_LANGS;
export const UI_BOARDS = CONFIG.UI_BOARDS;
export const UI_TRANSLATE = CONFIG.UI_TRANSLATE;

// 🔹 КОНТРАКТЫ / ХУКИ
export const C4C_ABI = CONFIG.C4C_ABI;
export const GAME_ABI = CONFIG.GAME_ABI;
export const toContractUnits = CONFIG.toWei;
export const useApproveC4C = CONFIG.useApproveC4C;
export const useCreateTokenGame = CONFIG.useCreateGame;
export const useJoinTokenGame = CONFIG.useJoinGame;
export const useClaimWinnings = CONFIG.useClaimWinnings;
export const useGameBalance = CONFIG.useGameBalance;

// 🔹 ИГРЫ / ЛОББИ
export const createTokenGameSession = CONFIG.createTokenGameSession;
export const publishGameToLobby = CONFIG.publishGameToLobby;
export const getLobbyGames = CONFIG.getLobbyGames;
export const generateGameInvite = CONFIG.generateGameInvite;
export const sendInviteToChat = CONFIG.sendInviteToChat;
export const canJoinGame = CONFIG.canJoinGame;

export const GAME_BALANCE_WINDOW_TITLE = CONFIG.GAME_BALANCE_WINDOW_TITLE;
export const GAME_BALANCE_JOIN_BUTTON = CONFIG.GAME_BALANCE_JOIN_BUTTON;
export const GAME_BALANCE_CREATE_BUTTON = CONFIG.GAME_BALANCE_CREATE_BUTTON;
export const GAME_BALANCE_INVITE_BUTTON = CONFIG.GAME_BALANCE_INVITE_BUTTON;
export const createGameWithStake = CONFIG.createGameWithStake;
export const joinGameWithStake = CONFIG.joinGameWithStake;
export const useGameBalanceManager = CONFIG.useGameBalanceManager;
export const publishGameToLobbyExtended = CONFIG.publishGameToLobbyExtended;
export const getLobbyGamesExtended = CONFIG.getLobbyGamesExtended;
export const generateGameInviteExtended = CONFIG.generateGameInviteExtended;
export const sendInviteToChatExtended = CONFIG.sendInviteToChatExtended;
export const canJoinGameExtended = CONFIG.canJoinGameExtended;
export const initClockExtended = CONFIG.initClockExtended;
export const tickClockExtended = CONFIG.tickClockExtended;
export const makeMoveExtended = CONFIG.makeMoveExtended;
export const checkTimeWin = CONFIG.checkTimeWin;
export const formatClockExtended = CONFIG.formatClockExtended;
export const processTimeWin = CONFIG.processTimeWin;
