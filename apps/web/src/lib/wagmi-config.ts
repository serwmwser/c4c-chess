// apps/web/src/lib/wagmi-config.ts
import { createConfig, http } from 'wagmi';
import { bsc } from 'wagmi/chains';
import { walletConnect, metaMask } from 'wagmi/connectors';
import { CONFIG } from './config';

export const config = createConfig({
  chains: [bsc],
  connectors: [
    // 🔹 MetaMask (браузерное расширение)
    metaMask({
      dappMetadata: {
        name: CONFIG.APP_NAME,
        url: typeof window !== 'undefined' ? window.location.origin : 'https://c4c-chess.vercel.app',
      },
    }),
    // 🔹 WalletConnect (QR-код для мобильных)
    walletConnect({ 
      projectId: CONFIG.WALLETCONNECT_PROJECT_ID,
      showQrModal: true,
      meta {
        name: CONFIG.APP_NAME,
        description: CONFIG.APP_DESCRIPTION,
        url: typeof window !== 'undefined' ? window.location.origin : 'https://c4c-chess.vercel.app',
        icons: ['https://avatars.githubusercontent.com/u/37784886'],
      },
    }),
  ],
  transports: {
    [bsc.id]: http(CONFIG.RPC_URL),
  },
});