// apps/api/src/services/match.service.ts
import { Player, Match } from '../types/matchmaking';
import { v4 as uuidv4 } from 'uuid';

export class MatchService {
  private queues: Map<number, Player[]> = new Map();
  private activeMatches: Map<string, Match> = new Map();

  constructor() {
    // Инициализируем очереди для ставок от 50k до 1M с шагом 50k
    for (let stake = 50000; stake <= 1000000; stake += 50000) {
      this.queues.set(stake, []);
    }
  }

  addPlayerToQueue(player: Player): string | null {
    const queue = this.queues.get(player.stake);
    if (!queue) return null;

    queue.push(player);

    if (queue.length >= 2) {
      const player1 = queue.shift();
      const player2 = queue.shift();
      
      if (player1 && player2) {
        return this.createMatch(player1, player2);
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
    console.log(`🤝 Match created: ${matchId}`);
    return matchId;
  }

  getMatch(matchId: string): Match | undefined {
    return this.activeMatches.get(matchId);
  }
}