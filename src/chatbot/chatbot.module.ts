import { Module } from '@nestjs/common';

import { ChatbotService } from './chatbot.service';
import { ChatbotGateway } from './chatbot.gateway';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  providers: [ChatbotGateway, ChatbotService],
  imports: [AuthModule]
})
export class ChatbotModule {}
