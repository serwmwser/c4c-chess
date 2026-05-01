// apps/api/src/services/match.service.ts
import { Player, Match } from '../types/matchmaking';
import { v4 as uuidv4 } from 'uuid'; // Вам нужно будет установить uuid: npm install uuid @types/uuid

export class MatchService {
  private queues: Map<number, Player[]> = new Map(); // Ключ - размер ставки
  private activeMatches: Map<string, Match> = new Map();

  constructor() {
    // Инициализируем очереди для возможных ставок (50k, 100k, ... 1M)
    for (let stake = 50000; stake <= 1000000; stake += 50000) {
      this.queues.set(stake, []);
    }
  }

  addPlayerToQueue(player: Player): string | null {
    const queue = this.queues.get(player.stake);
    if (!queue) return null;

    queue.push(player);

    // Если в очереди 2 игрока, создаем матч
    if (queue.length >= 2) {
      const player1 = queue.shift();
      const player2 = queue.shift();
      
      if (player1 && player2) {
        const matchId = this.createMatch(player1, player2);
        return matchId;
      }
    }
    return null;
  }

  removePlayerFromQueue(socketId: string) {
    for (const [, players] of this.queues) {
      const index = players.findIndex(p => p.socketId === socketId);
      if (index !== -1) {
        players.splice(index, 1);
        break;
      }
    }
  }

  private createMatch(player1: Player, player2: Player): string {
    const matchId = uuidv4();
    const match: Match = {
      id: matchId,
      player1,
      player2,
      status: 'active',
      createdAt: new Date(),
    };
    this.activeMatches.set(matchId, match);
    console.log(`Match created: ${matchId} between ${player1.address} and ${player2.address}`);
    return matchId;
  }

  getMatch(matchId: string): Match | undefined {
    return this.activeMatches.get(matchId);
  }
}