import { Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { NotificationsService } from './notifications.service';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';

@WebSocketGateway({ cors: true, namespace: 'notifications' })
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  
  @WebSocketServer() wss: Server;
  private readonly logger = new Logger(NotificationsGateway.name);
  private connectedUsers = new Map<string, string>();

  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly jwtService: JwtService
  ) {}

  async handleConnection(client: Socket) {
    const token = client.handshake.headers.authentication as string;

    try {
      const payload: JwtPayload = this.jwtService.verify(token);
      client.data.userId = payload.id;
      this.connectedUsers.set(payload.id, client.id);
      this.logger.log(`User connected: ${payload.id}`);

      const unread = await this.notificationsService.getUnreadNotifications(payload.id);
      if (unread.length > 0)
        client.emit('notifications.unread', { notifications: unread });
    } catch (error) {
      this.logger.error(`Connection error: ${error}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    if (client.data.userId) {
      this.connectedUsers.delete(client.data.userId);
      this.logger.log(`User disconnected: ${client.data.userId}`)
    }
  }

  @SubscribeMessage('notifications.markAsRead')
  async onMarkAsRead(client: Socket, payload: { notificationId: string }) {
    await this.notificationsService.markAsRead(payload.notificationId, client.data.userId);
  }

  @SubscribeMessage('notifications.markAllAsRead')
  async onMarkAllAsRead(client: Socket) {
    await this.notificationsService.markAllAsRead(client.data.userId);
  }

  emitToUser(userId: string, event: string, data: unknown) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId)
      this.wss.to(socketId).emit(event, data);
  }
}
