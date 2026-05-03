import{CONFIG_BASE}from'./config-base';
import{PATCH_001}from'./config-patch-001';import{PATCH_002}from'./config-patch-002';import{PATCH_003}from'./config-patch-003';import{PATCH_004}from'./config-patch-004';import{PATCH_005}from'./config-patch-005';import{PATCH_006}from'./config-patch-006';import{PATCH_007}from'./config-patch-007';import{PATCH_008}from'./config-patch-008';import{PATCH_009}from'./config-patch-009';import{PATCH_010}from'./config-patch-010';import{PATCH_011}from'./config-patch-011';import{PATCH_014}from'./config-patch-014';import{PATCH_015}from'./config-patch-015';

// 🔹 КОНСТРУКТОР: Собираем все патчи в один объект
export const CONFIG={
  ...CONFIG_BASE,
  ...PATCH_001,...PATCH_002,...PATCH_003,...PATCH_004,
  ...PATCH_005,...PATCH_006,...PATCH_007,...PATCH_008,...PATCH_009,
  ...PATCH_010,...PATCH_011,...PATCH_014,...PATCH_015
};

// 🔹 ЭКСПОРТЫ: Всё, что нужно приложению
export const APP_NAME=CONFIG.APP_NAME;export const C4C_TOKEN_ADDRESS=CONFIG.C4C_TOKEN_ADDRESS;export const GAME_CONTRACT_ADDRESS=CONFIG.GAME_CONTRACT_ADDRESS;export const CHAIN_ID=CONFIG.CHAIN_ID;export const WALLETCONNECT_PROJECT_ID=CONFIG.WALLETCONNECT_PROJECT_ID;export const C4C_BUY_URL=CONFIG.C4C_BUY_URL;
// Базовые опции
export const TIME_OPTIONS=CONFIG.TIME_OPTIONS;export const STAKE_OPTIONS=CONFIG.STAKE_OPTIONS;
export const formatTime=CONFIG.formatTime;export const formatC4C=CONFIG.formatC4C;export const getBotMove=CONFIG.getBotMove;export const saveProfileToStorage=CONFIG.saveProfileToStorage;export const loadProfileFromStorage=CONFIG.loadProfileFromStorage;export const createWagmiConfig=CONFIG.createWagmiConfig;export const canConnectToMetaMask=CONFIG.canConnectToMetaMask;export const canConnectToWalletConnect=CONFIG.canConnectToWalletConnect;export const resetConnectionStates=CONFIG.resetConnectionStates;export const FIXED_CSS=CONFIG.FIXED_CSS;export const injectGlobalStyles=CONFIG.injectGlobalStyles;export const getFriends=CONFIG.getFriends;export const addFriend=CONFIG.addFriend;export const processPayout=CONFIG.processPayout;export const getOnlineGames=CONFIG.getOnlineGames;
// UI и Локализация
export const UI_THEMES=CONFIG.UI_THEMES;export const UI_LANGS=CONFIG.UI_LANGS;export const UI_BOARDS=CONFIG.UI_BOARDS;export const UI_TRANSLATE=CONFIG.UI_TRANSLATE;
// Старая логика (Патч 10)
export const VALID_STAKES=CONFIG.VALID_STAKES;export const VALID_TIMES=CONFIG.VALID_TIMES;export const validateGameConfig=CONFIG.validateGameConfig;export const createTokenGameSession=CONFIG.createTokenGameSession;export const recordGameMove=CONFIG.recordGameMove;export const getMyActiveGames=CONFIG.getMyActiveGames;export const canRefundGame=CONFIG.canRefundGame;
// Контракты (Патч 14)
export const C4C_ABI=CONFIG.C4C_ABI;export const GAME_ABI=CONFIG.GAME_ABI;export const toContractUnits=CONFIG.toContractUnits;export const validateStake=CONFIG.validateStake;export const useApproveC4C=CONFIG.useApproveC4C;export const useCreateTokenGame=CONFIG.useCreateTokenGame;export const useJoinTokenGame=CONFIG.useJoinTokenGame;export const generateGameInvite=CONFIG.generateGameInvite;export const sendInviteToChat=CONFIG.sendInviteToChat;export const publishGameToLobby=CONFIG.publishGameToLobby;export const canJoinGame=CONFIG.canJoinGame;
// Новые ставки и призовой фонд (Патч 15)
export const ALLOWED_STAKES=CONFIG.ALLOWED_STAKES;export const MIN_STAKE=CONFIG.MIN_STAKE;export const C4C_DECIMALS=CONFIG.C4C_DECIMALS;export const validateExactStake=CONFIG.validateExactStake;export const calculatePrizePool=CONFIG.calculatePrizePool;export const formatPrizePool=CONFIG.formatPrizePool;
