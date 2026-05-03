import{createConfig,http}from'wagmi';import{bsc}from'wagmi/chains';import{walletConnect,metaMask}from'wagmi/connectors';
import{APP_NAME,APP_DESCRIPTION,WALLETCONNECT_PROJECT_ID,RPC_URL}from'./config-base';

export function createWagmiConfigPatched(){
  return createConfig({
    chains:[bsc],
    connectors:[
      // 🔥 MetaMask: только валидные свойства wagmi v2
      metaMask({dappMetadata:{name:APP_NAME,url:'https://c4c-chess.vercel.app'}}),
      // 🔥 WalletConnect: только валидные свойства
      walletConnect({
        projectId:WALLETCONNECT_PROJECT_ID,
        showQrModal:true,
        metadata:{name:APP_NAME,description:APP_DESCRIPTION,url:'https://c4c-chess.vercel.app',icons:[]},
      }),
    ],
    transports:{[bsc.id]:http(RPC_URL)},
  });
}

// 🔥 Функции управления состоянием подключения (без onConnectError)
export function canConnectMetaPatched():boolean{
  if(typeof window==='undefined')return true;
  const now=Date.now(),lastError=(window as any).__c4c_mm_error||0;
  if(now-lastError<5000)return false;
  const pending=(window as any).__c4c_mm_pending;
  if(pending)return false;
  (window as any).__c4c_mm_pending=true;
  setTimeout(()=>{if(typeof window!=='undefined')(window as any).__c4c_mm_pending=false;},10000);
  return true;
}

export function canConnectWCPatched():boolean{
  if(typeof window==='undefined')return true;
  const now=Date.now(),lastError=(window as any).__c4c_wc_error||0;
  if(now-lastError<5000)return false;
  const pending=(window as any).__c4c_wc_pending;
  if(pending)return false;
  (window as any).__c4c_wc_pending=true;
  setTimeout(()=>{if(typeof window!=='undefined')(window as any).__c4c_wc_pending=false;},10000);
  return true;
}

export function forceResetConnections(){
  if(typeof window!=='undefined'){
    (window as any).__c4c_mm_pending=false;(window as any).__c4c_wc_pending=false;
    (window as any).__c4c_mm_error=0;(window as any).__c4c_wc_error=0;
  }
}

export const PATCH_001={
  createWagmiConfig:createWagmiConfigPatched,
  canConnectToMetaMask:canConnectMetaPatched,
  canConnectToWalletConnect:canConnectWCPatched,
  resetConnectionStates:forceResetConnections,
};
