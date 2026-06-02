import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import * as amqp from 'amqplib'

@Injectable()
export class RabbitmqService implements OnModuleInit, OnModuleDestroy {

  private readonly logger = new Logger(RabbitmqService.name);
  private connection: amqp.ChannelModel;
  private channel: amqp.Channel;
  private connected = false;

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    await this.channel?.close();
    await this.connection?.close();
    this.logger.log('RabbitMQ disconnected');
  }

  private async connect(): Promise<void> {
    const url = process.env.RABBITMQ_URL;

    if (!url)
      throw new Error('RABBITMQ_URL is not defined in environment variables');

    this.connection = await amqp.connect(url);
    this.channel = await this.connection.createChannel();
    this.connected = true;
    this.logger.log('RabbitMQ connected');
  }

  getChannel(): amqp.Channel {
    if (!this.channel)
      throw new Error('RabbitMQ channel not initialized');

    return this.channel;
  }
}
