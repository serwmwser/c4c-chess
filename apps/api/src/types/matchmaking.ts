// apps/api/src/types/matchmaking.ts

export interface Player {
    id: string;
    address: string;
    stake: number;
    socketId: string;
  }
  
  export interface Match {
    id: string;
    player1: Player;
    player2: Player;
    status: 'waiting' | 'active' | 'finished';
    winner?: string;
    createdAt: Date;
  }
  
  export interface GameState {
    matchId: string;
    fen: string;
    turn: 'white' | 'black';
    moves: string[];
  }