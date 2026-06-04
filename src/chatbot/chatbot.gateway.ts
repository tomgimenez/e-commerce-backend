import { JwtService } from '@nestjs/jwt';
import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatbotService } from './chatbot.service';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { Logger } from '@nestjs/common';

@WebSocketGateway({ cors: true, namespace: 'chatbot' })
export class ChatbotGateway implements OnGatewayConnection, OnGatewayDisconnect {
  
  @WebSocketServer() wss: Server;
  private readonly logger = new Logger(ChatbotGateway.name);

  constructor(
    private readonly chatbotService: ChatbotService,
    private readonly jwtService: JwtService
  ) {}

  async handleConnection( client: Socket ) {
    const token = client.handshake.headers.authentication as string;

    if (token) {
      try {
  
        const payload: JwtPayload = this.jwtService.verify( token );
        client.data.userId = payload.id;
        this.logger.log(`Client connected: ${client.id} - userId: ${payload.id}`);
  
      } catch (error) {
        this.logger.warn(`Invalid token, connecting as anonymous: ${client.id}`);
        client.data.userId = null;
      }
    } else {
      client.data.userId = null;
      this.logger.log(`Anonymous client connected: ${client.id}`);
    }

  }

  handleDisconnect( client: Socket ) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('chatbot.message')
  async onMessage( client: Socket, payload: { message: string } ) {
    
    const sessionId = client.data.userId
      ? `user-${client.data.userId}`
      : `anon-${client.id}`;

    this.chatbotService.registerResponseHandler(sessionId, (response: string)=> {
      client.emit('chatbot.response', { response });
    });

    await this.chatbotService.sendMessage(sessionId, payload.message);
  }
}
