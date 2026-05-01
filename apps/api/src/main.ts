// apps/api/src/main.ts
import { createServer } from 'http';
import { Server } from 'socket.io';
import { LobbyGateway } from './game/lobby.gateway';

const PORT = process.env.PORT || 3001;

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

new LobbyGateway(io);

httpServer.listen(PORT, () => {
  console.log(`✅ Game server is running on port ${PORT}`);
});