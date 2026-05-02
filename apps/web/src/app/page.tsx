// apps/web/src/app/page.tsx
'use client';

import { useConnect, useAccount, useDisconnect, useConnectors } from 'wagmi';

export default function Home() {
  const { connect, isPending } = useConnect();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const connectors = useConnectors();

  // 🔹 Находим коннекторы по типу
  const injectedConnector = connectors.find(c => c.type === 'injected');
  const walletConnectConnector = connectors.find(c => c.type === 'walletConnect');

  // 🔹 Если уже подключен — показываем адрес и кнопку отключения
  if (isConnected && address) {
    return (
      <main className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-8 gap-4">
        <h1 className="text-4xl font-bold">♟️ C4C Chess</h1>
        <div className="bg-gray-800 p-6 rounded-lg text-center space-y-4">
          <p className="text-green-400 font-mono text-sm break-all">{address}</p>
          <p className="text-gray-400 text-sm">Connected via {injectedConnector ? 'Browser Extension' : 'WalletConnect'}</p>
          <button
            onClick={() => disconnect()}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-sm font-medium"
          >
            Disconnect
          </button>
        </div>
      </main>
    );
  }

  // 🔹 Если не подключен — показываем две кнопки
  return (
    <main className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-8 gap-6">
      <h1 className="text-4xl font-bold">♟️ C4C Chess</h1>
      <p className="text-gray-400 text-center max-w-md">
        Play chess, earn C4C tokens on BSC
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        {/* 🔹 Кнопка 1: Подключение через расширение браузера (MetaMask) */}
        <button
          onClick={() => injectedConnector && connect({ connector: injectedConnector })}
          disabled={isPending || !injectedConnector}
          className="px-6 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 rounded font-bold text-white transition flex items-center gap-2"
        >
          <span>🦊</span>
          <span>Connect MetaMask</span>
        </button>

        {/* 🔹 Кнопка 2: Подключение через QR-код (мобильные кошельки) */}
        <button
          onClick={() => walletConnectConnector && connect({ connector: walletConnectConnector })}
          disabled={isPending || !walletConnectConnector}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded font-bold text-white transition flex items-center gap-2"
        >
          <span>📱</span>
          <span>Connect via QR</span>
        </button>
      </div>

      <p className="text-xs text-gray-500 mt-8">
        Token: 0xaac20575371de01b4d10c4e7566d5453d72d56e7
      </p>
    </main>
  );
}