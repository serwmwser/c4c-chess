import{createConfig,http}from'wagmi';import{bsc}from'wagmi/chains';import{walletConnect,metaMask}from'wagmi/connectors';
import{APP_NAME,APP_DESCRIPTION,WALLETCONNECT_PROJECT_ID,RPC_URL}from'./config-base';
export function createWagmiConfigPatched(){return createConfig({chains:[bsc],connectors:[metaMask({dappMetadata:{name:APP_NAME,url:'https://c4c-chess.vercel.app'}}),walletConnect({projectId:WALLETCONNECT_PROJECT_ID,showQrModal:true,metadata:{name:APP_NAME,description:APP_DESCRIPTION,url:'https://c4c-chess.vercel.app',icons:[]}}),],transports:{[bsc.id]:http(RPC_URL)},});}
export function canConnectMetaPatched():boolean{return typeof window!=='undefined';}
export function canConnectWCPatched():boolean{return typeof window!=='undefined';}
export function forceResetConnections(){}
export const PATCH_001={createWagmiConfig:createWagmiConfigPatched,canConnectToMetaMask:canConnectMetaPatched,canConnectToWalletConnect:canConnectWCPatched,resetConnectionStates:forceResetConnections,};
