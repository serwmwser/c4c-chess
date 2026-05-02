// apps/api/src/services/match.service.ts
import { v4 as uuidv4 } from 'uuid';

interface Room {
  id: string;
  white: string;
  black: string | null;
  stake: number;
  timeControl: number;
  fen: string;
}

export class MatchService {
  private rooms: Map<string, Room> = new Map();

  // Исправлено: добавлено имя параметра data и тип any
  createRoom( data: any): Room {
    const roomId = uuidv4();
    const room: Room = {
      id: roomId,
      white: data.nickname || 'Player1',
      black: null,
      stake: data.stakeAmount || 0,
      timeControl: data.timeControl || 600,
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
    };
    this.rooms.set(roomId, room);
    return room;
  }

  joinRoom(roomId: string, nickname: string): Room {
    const room = this.rooms.get(roomId);
    if (!room) throw new Error('Room not found');
    if (room.black) throw new Error('Room is full');

    room.black = nickname;
    this.rooms.set(roomId, room);
    return room;
  }

  handleMove(roomId: string, move: any, callback: (fen: string) => void) {
    const room = this.rooms.get(roomId);
    if (!room) return;
    callback(room.fen); 
  }

  getAvailableRooms() {
    const available: any[] = [];
    this.rooms.forEach((room) => {
      if (!room.black) {
        available.push({
          id: room.id,
          white: room.white,
          stake: room.stake,
          timeControl: room.timeControl
        });
      }
    });
    return available;
  }
}

export const matchService = new MatchService();