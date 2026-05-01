// apps/api/src/game/lobby.gateway.ts
import { Server, Socket } from 'socket.io';
import { MatchService } from '../services/match.service';
import { ContractService } from '../services/contract.service';
import { isValidStake } from '../config/stake.config';
import { Player } from '../types/matchmaking';

export class LobbyGateway {
  private io: Server;
  private matchService: MatchService;
  private contractService: ContractService;

  constructor(io: Server) {
    this.io = io;
    this.matchService = new MatchService();
    this.contractService = new ContractService();
    this.setupListeners();
  }

  private setupListeners() {
    this.io.on('connection', (socket: Socket) => {
      console.log(`⚡ Player connected: ${socket.id}`);

      // Игрок хочет войти в лобби с определенной ставкой
      socket.on('joinLobby', async (data: { address: string, stake: number }) => {
        try {
          const { address, stake } = data;

          // 1. Валидация суммы ставки
          if (!isValidStake(stake)) {
            socket.emit('error', { message: 'Invalid stake amount. Must be between 50k and 1M, step 50k.' });
            return;
          }

          // 2. Проверка баланса токенов в блокчейне
          // ВНИМАНИЕ: Это может занять время, если RPC медленный
          const hasBalance = await this.contractService.validateStake(address, stake);
          if (!hasBalance) {
            socket.emit('error', { message: 'Insufficient C4C token balance.' });
            return;
          }

          // 3. Добавление в очередь поиска
          const player: Player = {
            id: socket.id,
            address,
            stake,
            socketId: socket.id
          };

          const matchId = this.matchService.addPlayerToQueue(player);

          if (matchId) {
            // Если матч найден, уведомляем обоих игроков
            const match = this.matchService.getMatch(matchId);
            if (match) {
              // Игрок 1 (Белые)
              this.io.to(match.player1.socketId).emit('matchFound', { 
                matchId, 
                opponent: match.player2.address, 
                color: 'white' 
              });
              
              // Игрок 2 (Черные)
              this.io.to(match.player2.socketId).emit('matchFound', { 
                matchId, 
                opponent: match.player1.address, 
                color: 'black' 
              });
              
              // Создаем отдельную комнату для этой партии
              socket.join(matchId);
              this.io.sockets.sockets.get(match.player1.socketId)?.join(matchId);
              
              console.log(`🎮 Match started: ${matchId}`);
            }
          } else {
            socket.emit('waitingForOpponent', { stake });
          }

        } catch (error) {
          console.error(error);
          socket.emit('error', { message: 'Server error during matchmaking.' });
        }
      });

      // Обработка хода
      socket.on('makeMove', (data: { matchId: string, move: any }) => {
        // Пересылаем ход противнику в той же комнате
        socket.to(data.matchId).emit('opponentMove', data.move);
      });

      socket.on('disconnect', () => {
        console.log(`❌ Player disconnected: ${socket.id}`);
        this.matchService.removePlayerFromQueue(socket.id);
      });
    });
  }
}