// apps/web/src/app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect, useConnectors, useBalance } from 'wagmi';
import { Chess } from 'chess.js';
import { CONFIG } from '@/lib/config';

export default function App() {
  const { address, isConnected, chain } = useAccount();
  const { connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const connectors = useConnectors();
  const [showModal, setShowModal] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  // 🔥 Баланс токенов
  const {  balance, status: balanceStatus } = useBalance({
    address: address,
    token: CONFIG.C4C_TOKEN_ADDRESS as `0x${string}`,
    query: { enabled: !!address && !!chain?.id && chain.id === CONFIG.CHAIN_ID },
  });

  // 🔥 Определяем, что рендерим на клиенте (предотвращаем гидратацию)
  useEffect(() => {
    setIsClient(true);
  }, []);

  // 🔥 Простая функция подключения (защита от дублей)
  const handleConnect = (connector: any) => {
    if (isPending) return;
    connect({ connector });
    setShowModal(false);
  };

  // 🔥 Пока не клиент — показываем заглушку (предотвращаем #418)
  if (!isClient) {
    return (
      <main style={{ minHeight: '100vh', background: '#111827', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>⏳ Загрузка...</p>
      </main>
    );
  }

  // 🔥 НЕ ПОДКЛЮЧЁН → показываем кнопку "Войти"
  if (!isConnected) {
    return (
      <main style={{ minHeight: '100vh', background: '#111827', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '36px', marginBottom: '16px', fontWeight: 'bold' }}>♟️ {CONFIG.APP_NAME}</h1>
        <p style={{ color: '#9ca3af', marginBottom: '40px', maxWidth: '450px', lineHeight: '1.6' }}>{CONFIG.APP_DESCRIPTION}</p>
        
        <button 
          onClick={() => setShowModal(true)}
          disabled={isPending}
          style={{ 
            padding: '16px 40px', 
            background: isPending ? '#6b7280' : '#f59e0b', 
            color: 'white', 
            border: 'none', 
            borderRadius: '12px', 
            fontSize: '20px', 
            fontWeight: 'bold', 
            cursor: isPending ? 'not-allowed' : 'pointer' 
          }}
        >
          {isPending ? '⏳ Подключение...' : '🔗 Войти в приложение'}
        </button>

        {/* 🔥 Модальное окно выбора кошелька */}
        {showModal && (
          <div 
            style={{ 
              position: 'fixed', 
              inset: 0, 
              background: 'rgba(0,0,0,0.85)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              zIndex: 1000 
            }} 
            onClick={() => setShowModal(false)}
          >
            <div 
              style={{ 
                background: '#1f2937', 
                borderRadius: '16px', 
                padding: '24px', 
                maxWidth: '400px', 
                width: '100%',
                border: '1px solid #374151'
              }} 
              onClick={e => e.stopPropagation()}
            >
              <h3 style={{ color: 'white', marginBottom: '20px', textAlign: 'center' }}>Выберите кошелёк</h3>
              
              {/* MetaMask */}
              <button
                onClick={() => {
                  const mm = connectors.find(c => c.type === 'metaMask');
                  if (mm) handleConnect(mm);
                }}
                disabled={isPending}
                style={{
                  width: '100%',
                  padding: '14px',
                  margin: '8px 0',
                  background: '#f59e0b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: isPending ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px'
                }}
              >
                🦊 MetaMask
              </button>
              
              {/* WalletConnect QR */}
              <button
                onClick={() => {
                  const wc = connectors.find(c => c.type === 'walletConnect');
                  if (wc) handleConnect(wc);
                }}
                disabled={isPending || CONFIG.WALLETCONNECT_PROJECT_ID === 'demo'}
                style={{
                  width: '100%',
                  padding: '14px',
                  margin: '8px 0',
                  background: (CONFIG.WALLETCONNECT_PROJECT_ID !== 'demo') ? '#3b82f6' : '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: (CONFIG.WALLETCONNECT_PROJECT_ID !== 'demo' && !isPending) ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px'
                }}
              >
                📱 WalletConnect QR
              </button>
              
              {CONFIG.WALLETCONNECT_PROJECT_ID === 'demo' && (
                <p style={{ fontSize: '12px', color: '#fbbf24', textAlign: 'center', marginTop: '12px' }}>
                  ⚠️ QR не работает с ключом 'demo'. Получите ключ на cloud.walletconnect.com
                </p>
              )}
              
              <button
                onClick={() => setShowModal(false)}
                style={{
                  width: '100%',
                  padding: '12px',
                  margin: '16px 0 0 0',
                  background: '#374151',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Закрыть
              </button>
            </div>
          </div>
        )}
      </main>
    );
  }

  // 🔥 ПОДКЛЮЧЁН → показываем профиль + доску
  return (
    <main style={{ minHeight: '100vh', background: '#111827', color: 'white', padding: '20px' }}>
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>
        {/* Хедер */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '20px', borderBottom: '1px solid #374151' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>♟️ {CONFIG.APP_NAME}</h1>
          <button 
            onClick={() => disconnect()} 
            style={{ padding: '10px 20px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
          >
            Выйти
          </button>
        </header>

        {/* Профиль */}
        <section style={{ marginTop: '32px', padding: '28px', background: '#1f2937', borderRadius: '16px', border: '1px solid #374151' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '20px', fontWeight: 600 }}>👤 Профиль</h2>
          
          <p style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>Адрес кошелька</p>
          <p style={{ fontFamily: 'monospace', fontSize: '14px', color: '#22c55e', wordBreak: 'break-all', background: '#111827', padding: '12px', borderRadius: '8px' }}>
            {address}
          </p>
          
          <p style={{ marginTop: '20px', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>Баланс {CONFIG.APP_NAME}</p>
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#f59e0b' }}>
            {balanceStatus === 'pending' && '⏳ Загрузка...'}
            {balanceStatus === 'error' && '❌ Ошибка'}
            {balanceStatus === 'success' && balance?.formatted 
              ? `${parseFloat(balance.formatted).toFixed(2)} C4C` 
              : '0.00 C4C'}
          </p>
        </section>

        {/* Простая шахматная доска (демо) */}
        <section style={{ marginTop: '32px', padding: '20px', background: '#1f2937', borderRadius: '16px', border: '1px solid #374151', textAlign: 'center' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>♟️ Быстрая игра</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '2px', background: '#374151', borderRadius: '8px', maxWidth: '320px', margin: '0 auto' }}>
            {Array.from({ length: 64 }).map((_, i) => {
              const fi = i % 8;
              const ri = Math.floor(i / 8);
              const bg = (fi + ri) % 2 === 0 ? '#eeeed2' : '#769656';
              return <div key={i} style={{ aspectRatio: '1', background: bg }} />;
            })}
          </div>
          <p style={{ marginTop: '16px', color: '#9ca3af', fontSize: '14px' }}>
            🎮 Полная доска с фигурами — после настройки смарт-контракта
          </p>
        </section>

        {/* Футер */}
        <footer style={{ marginTop: '48px', paddingTop: '24px', borderTop: '1px solid #374151', textAlign: 'center', fontSize: '12px', color: '#6b7280' }}>
          <p>Сеть: {CONFIG.CHAIN_NAME} (ID: {CONFIG.CHAIN_ID})</p>
          <p style={{ marginTop: '4px' }}>Токен: {CONFIG.C4C_TOKEN_ADDRESS.slice(0, 10)}...{CONFIG.C4C_TOKEN_ADDRESS.slice(-8)}</p>
        </footer>
      </div>
    </main>
  );
}