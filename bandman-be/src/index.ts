import 'reflect-metadata';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { app } from '@/app';
import { initializeWebSocket } from '@/config/websocket';

dotenv.config();

const PORT = process.env.PORT || 3000;

const httpServer = createServer(app);

// Initialize WebSocket
initializeWebSocket(httpServer);

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`WebSocket server initialized`);
});
