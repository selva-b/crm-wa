import { Module } from '@nestjs/common';
import { AiModule } from '@/modules/ai/ai.module';
import { KnowledgeBaseModule } from '@/modules/knowledge-base/knowledge-base.module';
import { ChatbotRepository } from './infrastructure/repositories/chatbot.repository';
import { ChatbotController } from './interfaces/controllers/chatbot.controller';
import { ExecuteChatbotFlowUseCase } from './application/use-cases/execute-chatbot-flow.use-case';

@Module({
  imports: [AiModule, KnowledgeBaseModule],
  controllers: [ChatbotController],
  providers: [ChatbotRepository, ExecuteChatbotFlowUseCase],
  exports: [ChatbotRepository, ExecuteChatbotFlowUseCase],
})
export class ChatbotModule {}
