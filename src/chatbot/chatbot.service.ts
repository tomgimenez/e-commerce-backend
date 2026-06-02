import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';

import { RabbitmqService } from 'src/rabbitmq/rabbitmq.service';

const QUEUE_IN = 'message.sent';
const QUEUE_OUT = 'message.response';

@Injectable()
export class ChatbotService implements OnApplicationBootstrap  {

  private readonly logger = new Logger(ChatbotService.name);
  private responseHandlers = new Map<string, (response: string) => void>();
    
  constructor(private readonly rabbitmqService: RabbitmqService) {}

  async onApplicationBootstrap() {
    await this.listenForResponses();
  }

  async sendMessage(sessionId: string, userMessage: string): Promise<void> {
    const channel = this.rabbitmqService.getChannel();

    await channel.assertQueue(QUEUE_IN, { durable: true });

    channel.sendToQueue(
      QUEUE_IN,
      Buffer.from(JSON.stringify({ sessionId, userMessage })),
      { persistent: true }
    );

    this.logger.log(`Message published - sessionId: ${sessionId}`);
  }

  private async listenForResponses(): Promise<void> {
    const channel = this.rabbitmqService.getChannel();

    await channel.assertQueue(QUEUE_OUT, { durable: true });

    channel.consume(QUEUE_OUT, (msg) => {
      if (!msg) return;

      const { sessionId, response } = JSON.parse(msg.content.toString());

      this.logger.log(`Response received - sessionId: ${sessionId}`);

      const handler = this.responseHandlers.get(sessionId);
      if (handler) {
        handler(response);
        this.responseHandlers.delete(sessionId);
      }

      channel.ack(msg);
    });
  }

  registerResponseHandler(sessionId: string, handler: (response: string) => void): void {
    this.responseHandlers.set(sessionId, handler);
  }
}
