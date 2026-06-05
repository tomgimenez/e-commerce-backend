import { Module } from '@nestjs/common';

import { ChatbotService } from './chatbot.service';
import { ChatbotGateway } from './chatbot.gateway';

@Module({
  providers: [ChatbotGateway, ChatbotService]
})
export class ChatbotModule {}
