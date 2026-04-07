import { Module } from '@nestjs/common';
import { AiProviderService } from './domain/services/ai-provider.service';
import { GetSmartRepliesUseCase } from './application/use-cases/get-smart-replies.use-case';
import { SummarizeConversationUseCase } from './application/use-cases/summarize-conversation.use-case';
import { AnalyzeSentimentUseCase } from './application/use-cases/analyze-sentiment.use-case';
import { AutoCategorizeUseCase } from './application/use-cases/auto-categorize.use-case';
import { KbRagSearchUseCase } from './application/use-cases/kb-rag-search.use-case';
import { DetectIntentUseCase } from './application/use-cases/detect-intent.use-case';
import { AiController } from './interfaces/controllers/ai.controller';

@Module({
  controllers: [AiController],
  providers: [
    AiProviderService,
    GetSmartRepliesUseCase,
    SummarizeConversationUseCase,
    AnalyzeSentimentUseCase,
    AutoCategorizeUseCase,
    KbRagSearchUseCase,
    DetectIntentUseCase,
  ],
  exports: [
    AiProviderService,
    AnalyzeSentimentUseCase,
    AutoCategorizeUseCase,
    KbRagSearchUseCase,
    DetectIntentUseCase,
  ],
})
export class AiModule {}
