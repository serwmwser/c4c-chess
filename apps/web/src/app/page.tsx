// apps/web/src/app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { getSocket } from '@/lib/socket';

export default function Home() {
  const [status, setStatus] = useState('Отключение...');
  const [socketId, setSocketId] = useState<string | null>(null);

  useEffect(() => {
    const socket = getSocket();

    socket.on('connect', () => {
      setStatus('Подключено ✅');
      setSocketId(socket.id || null);
      console.log('Connected with ID:', socket.id);
    });

    socket.on('disconnect', () => {
      setStatus('Отключено ❌');
      setSocketId(null);
    });

    socket.on('connect_error', (err) => {
      setStatus(`Ошибка подключения: ${err.message}`);
    });

    // Пробуем подключиться, если еще не подключены
    if (!socket.connected) {
      socket.connect();
    }

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
    };
  }, []);

  return (
    <main style={{ padding: '40px', fontFamily: 'Arial, sans-serif', textAlign: 'center' }}>
      <h1>♟️ C4C Chess Game</h1>
      <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h2>Статус сервера:</h2>
        <p style={{ fontSize: '18px', fontWeight: 'bold', color: status.includes('✅') ? 'green' : 'red' }}>
          {status}
        </p>
        {socketId && <p>ID сессии: {socketId}</p>}
      </div>
      
      <div style={{ marginTop: '30px' }}>
        <p>Адрес токена C4C: <code>0xaac20575371de01b4d10c4e7566d5453d72d56e7</code></p>
        <p>Контракт игры: <code>0xCf5E5d01ADd5e2Ba62B2f6747E5CFC43e36D5005</code></p>
      </div>
    </main>
  );
}