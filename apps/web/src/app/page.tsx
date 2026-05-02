// apps/web/src/app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { getSocket } from '@/lib/socket';
import CreateGameForm from '@/components/create-game-form';
import { RoomList } from '@/components/room-list';
import LiveGame from '@/components/live-game';
import { useGameStore } from '@/lib/game-store';
import { LobbyPanel } from '@/components/lobby-panel';

export default function Home() {
  const { activeRoom } = useGameStore();
  const [status, setStatus] = useState('Отключение...');

  useEffect(() => {
    const socket = getSocket();
    const handleConnect = () => setStatus('Подключено ✅');
    const handleDisconnect = () => setStatus('Отключено ❌');
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    if (!socket.connected) socket.connect();
    return () => { socket.off('connect', handleConnect); socket.off('disconnect', handleDisconnect); };
  }, []);

  const handleCreateGame = async ( any) => {
    const socket = getSocket();
    socket.emit('createRoom', data);
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">♟️ C4C Chess</h1>
          <span className={`px-3 py-1 rounded ${status.includes('✅') ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}`}>
            {status}
          </span>
        </header>
        
        {!activeRoom && <LobbyPanel />}

        {activeRoom ? <LiveGame /> : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            <CreateGameForm onCreateGame={handleCreateGame} />
            <RoomList />
          </div>
        )}
      </div>
    </main>
  );
}