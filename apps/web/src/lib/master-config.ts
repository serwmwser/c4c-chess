import{CONFIG_BASE}from'./config-base';
import{PATCH_001}from'./config-patch-001';
import{PATCH_002}from'./config-patch-002';
import{PATCH_003}from'./config-patch-003';

export const CONFIG={
  ...CONFIG_BASE,
  createWagmiConfig:PATCH_001.createWagmiConfig,
  canConnectToMetaMask:PATCH_001.canConnectToMetaMask,
  canConnectToWalletConnect:PATCH_001.canConnectToWalletConnect,
  resetConnectionStates:PATCH_001.resetConnectionStates,
  formatC4C:PATCH_002.formatC4C,
  ...PATCH_003, // 🔥 Все функции друзей, лобби и выплат
};

export const{
  C4C_TOKEN_ADDRESS,GAME_CONTRACT_ADDRESS,C4C_BUY_URL,CHAIN_ID,CHAIN_NAME,RPC_URL,
  APP_NAME,APP_DESCRIPTION,WALLETCONNECT_PROJECT_ID,HOW_TO_PLAY,
  LANGUAGES,TIME_OPTIONS,STAKE_OPTIONS,BOARD_THEMES,PROFILE_THEMES,
  formatTime,formatC4C,getBotMove,getBoardThemeForProfile,
  saveProfileToStorage,loadProfileFromStorage,
  createWagmiConfig,canConnectToMetaMask,canConnectToWalletConnect,resetConnectionStates,
  getPieceStyle,PIECE_SYMBOLS,
  getOnlineGames,createGameLobby,getFriends,addFriend,sendGameInvite,processPayout
}=CONFIG;
