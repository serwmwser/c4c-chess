// apps/web/src/components/create-game-form.tsx
'use client';

import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { useGameStore } from '@/lib/game-store';

interface CreateGameFormProps {
  onCreateGame: (data: any) => void;
}

export default function CreateGameForm({ onCreateGame }: CreateGameFormProps) {
  const { address } = useAccount();
  const { 
    nickname, setNickname, 
    matchType, setMatchType, 
    stakeAmount, setStakeAmount, 
    timeControl, setTimeControl,
    setActiveRoom 
  } = useGameStore();

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // 1. Вызываем функцию создания игры (отправка на сервер или в лобби)
      const room = await onCreateGame({
        nickname,
        matchType,
        stakeAmount: matchType === "ranked" ? stakeAmount : 0,
        timeControl,
      });

      // 2. Если комната создана, обновляем стейт вручную, чтобы типы совпадали
      if (room && room.id) {
        setActiveRoom({
          id: room.id,
          fen: room.fen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
          white: address || '',
          black: '', // Соперник появится позже
          stake: matchType === "ranked" ? stakeAmount : 0
        });
      }

    } catch (cause) {
      console.error(cause);
      setError(cause instanceof Error ? cause.message : "Failed to create room");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-gray-800 rounded-lg shadow-xl max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">Создать игру</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500 text-red-200 rounded text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {/* Никнейм */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Никнейм</label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Ваше имя"
            required
          />
        </div>

        {/* Тип матча */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Тип матча</label>
          <select
            value={matchType}
            onChange={(e) => setMatchType(e.target.value as 'ranked' | 'friendly')}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="ranked">Рейтинговый (со ставкой)</option>
            <option value="friendly">Дружеский (без ставки)</option>
          </select>
        </div>

        {/* Ставка (только для рейтинговых) */}
        {matchType === 'ranked' && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Ставка (C4C)</label>
            <input
              type="number"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(Number(e.target.value))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:ring-2 focus:ring-blue-500 outline-none"
              min="50000"
              step="50000"
            />
          </div>
        )}

        {/* Контроль времени */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Контроль времени (мин)</label>
          <select
            value={timeControl / 60}
            onChange={(e) => setTimeControl(Number(e.target.value) * 60)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value={5}>5 минут</option>
            <option value={10}>10 минут</option>
            <option value={15}>15 минут</option>
            <option value={30}>30 минут</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-3 px-4 rounded font-bold text-white transition-colors ${
            isSubmitting 
              ? 'bg-gray-600 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isSubmitting ? 'Создание...' : 'Начать игру'}
        </button>
      </div>
    </form>
  );
}

