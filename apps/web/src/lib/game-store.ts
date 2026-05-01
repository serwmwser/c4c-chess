// apps/web/src/lib/game-store.ts
import { create } from 'zustand';

interface Match {
  id: string;
  fen: string;
  white: string; // адрес игрока за белых
  black: string; // адрес игрока за черных
}

interface GameState {
  activeRoom: Match | null;
  setActiveRoom: (room: Match | null | ((prev: Match | null) => Match | null)) => void;
  isPlayerTurn: boolean;
  setIsPlayerTurn: (turn: boolean) => void;
  userAddress: string | null;
  setUserAddress: (address: string | null) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  activeRoom: null,
  userAddress: null,
  isPlayerTurn: false,

  setActiveRoom: (room) => {
    set((state) => {
      const newRoom = typeof room === 'function' ? room(state.activeRoom) : room;
      
      // Автоматически определяем, чей ход, если комната обновилась
      let isTurn = false;
      if (newRoom && state.userAddress) {
        // Простая логика: если FEN содержит "w" (white to move) и игрок белый, или "b" и игрок черный
        const isWhiteTurn = newRoom.fen.split(' ')[1] === 'w';
        const amIWhite = newRoom.white?.toLowerCase() === state.userAddress.toLowerCase();
        
        isTurn = (isWhiteTurn && amIWhite) || (!isWhiteTurn && !amIWhite);
      }

      return {
        activeRoom: newRoom,
        isPlayerTurn: isTurn
      };
    });
  },

  setIsPlayerTurn: (turn) => set({ isPlayerTurn: turn }),
  setUserAddress: (address) => set({ userAddress: address }),
}));