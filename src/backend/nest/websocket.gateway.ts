import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class RealtimeStockGateway {
  @WebSocketServer()
  server!: Server;

  @SubscribeMessage('patient:emergency-search')
  handleEmergencyPing(@MessageBody() data: { medicineName: string; lat: number; lng: number }) {
    console.log(`[WebSocket] Emergency Search Broadcast: ${data.medicineName}`);
    // Broadcast to nearby pharmacist sockets
    this.server.emit('pharmacist:live-request', {
      requestId: `req-${Date.now()}`,
      medicineName: data.medicineName,
      lat: data.lat,
      lng: data.lng,
      requestedAt: new Date().toLocaleTimeString()
    });
  }

  @SubscribeMessage('pharmacist:respond-stock')
  handleStockResponse(@MessageBody() data: { requestId: string; available: boolean; pharmacyName: string }) {
    console.log(`[WebSocket] Pharmacist Response: ${data.pharmacyName} -> Available: ${data.available}`);
    this.server.emit('patient:stock-response', data);
  }
}
