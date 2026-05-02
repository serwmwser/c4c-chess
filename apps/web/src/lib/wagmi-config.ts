// apps/web/src/lib/wagmi-config.ts
import { createConfig, http } from 'wagmi';
import { bsc } from 'wagmi/chains';
import { walletConnect, injected } from 'wagmi/connectors';

// 🔥 ЗАМЕНИ НА СВОЙ 32-СИМВОЛЬНЫЙ PROJECT ID
const PROJECT_ID = '286f8aa9e630099f05763481672dcdc5';

export const config = createConfig({
  chains: [bsc],
  connectors: [
    // 🔹 1. Injected: для расширений браузера (MetaMask, Coinbase, Brave)
    injected({ 
      shimDisconnect: true,
      target: 'metaMask', // Приоритет для MetaMask
    }),
    // 🔹 2. WalletConnect: для мобильных кошельков через QR
    walletConnect({ 
      projectId: PROJECT_ID,
      showQrModal: false, // Мы будем управлять модальным окном вручную
    }),
  ],
  transports: {
    [bsc.id]: http(),
  },
});