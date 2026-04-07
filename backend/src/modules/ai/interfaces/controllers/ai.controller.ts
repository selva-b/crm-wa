import {
  Controller, Get, Post, Param, Query, Body,
  ParseUUIDPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import { Permissions } from '@/common/decorators/permissions.decorator';
import { CurrentUser, JwtPayload } from '@/common/decorators/current-user.decorator';
import { PERMISSIONS } from '@/modules/rbac/domain/permissions.constants';
import { GetSmartRepliesUseCase } from '../../application/use-cases/get-smart-replies.use-case';
import { SummarizeConversationUseCase } from '../../application/use-cases/summarize-conversation.use-case';
import { AnalyzeSentimentUseCase } from '../../application/use-cases/analyze-sentiment.use-case';
import { AutoCategorizeUseCase } from '../../application/use-cases/auto-categorize.use-case';
import { KbRagSearchUseCase } from '../../application/use-cases/kb-rag-search.use-case';
import { DetectIntentUseCase } from '../../application/use-cases/detect-intent.use-case';

@Controller('ai')
export class AiController {
  constructor(
    private readonly getSmartReplies: GetSmartRepliesUseCase,
    private readonly summarizeConversation: SummarizeConversationUseCase,
    private readonly analyzeSentiment: AnalyzeSentimentUseCase,
    private readonly autoCategorize: AutoCategorizeUseCase,
    private readonly kbRagSearch: KbRagSearchUseCase,
    private readonly detectIntent: DetectIntentUseCase,
  ) {}

  @Get('smart-replies/:conversationId')
  @Permissions(PERMISSIONS.MESSAGES_READ)
  async smartReplies(
    @CurrentUser() user: JwtPayload,
    @Param('conversationId', ParseUUIDPipe) conversationId: string,
  ) {
    return this.getSmartReplies.execute(conversationId, user.orgId);
  }

  @Post('summarize/:conversationId')
  @Permissions(PERMISSIONS.MESSAGES_READ)
  @HttpCode(HttpStatus.OK)
  async summarize(
    @CurrentUser() user: JwtPayload,
    @Param('conversationId', ParseUUIDPipe) conversationId: string,
  ) {
    return this.summarizeConversation.execute(conversationId, user.orgId);
  }

  @Get('sentiment/:conversationId')
  @Permissions(PERMISSIONS.MESSAGES_READ)
  async sentiment(
    @CurrentUser() user: JwtPayload,
    @Param('conversationId', ParseUUIDPipe) conversationId: string,
  ) {
    return this.analyzeSentiment.execute(conversationId, user.orgId);
  }

  @Get('categorize/:conversationId')
  @Permissions(PERMISSIONS.MESSAGES_READ)
  async categorize(
    @CurrentUser() user: JwtPayload,
    @Param('conversationId', ParseUUIDPipe) conversationId: string,
  ) {
    return this.autoCategorize.execute(conversationId, user.orgId);
  }

  @Post('categorize/:conversationId/apply')
  @Permissions(PERMISSIONS.CONTACTS_UPDATE)
  @HttpCode(HttpStatus.OK)
  async applyCategorization(
    @CurrentUser() user: JwtPayload,
    @Param('conversationId', ParseUUIDPipe) conversationId: string,
  ) {
    return this.autoCategorize.applyToConversation(conversationId, user.orgId);
  }

  @Get('kb-search')
  @Permissions(PERMISSIONS.MESSAGES_READ)
  async kbSearch(
    @CurrentUser() user: JwtPayload,
    @Query('q') query: string,
  ) {
    return this.kbRagSearch.execute(query || '', user.orgId);
  }

  @Get('kb-suggest/:conversationId')
  @Permissions(PERMISSIONS.MESSAGES_READ)
  async kbSuggest(
    @CurrentUser() user: JwtPayload,
    @Param('conversationId', ParseUUIDPipe) conversationId: string,
  ) {
    return this.kbRagSearch.suggestForConversation(conversationId, user.orgId);
  }

  @Get('intent/:conversationId')
  @Permissions(PERMISSIONS.MESSAGES_READ)
  async detectIntentEndpoint(
    @CurrentUser() user: JwtPayload,
    @Param('conversationId', ParseUUIDPipe) conversationId: string,
  ) {
    return this.detectIntent.execute(conversationId, user.orgId);
  }

  /**
   * Full AI analysis — combines all AI features in one call.
   */
  @Post('analyze/:conversationId')
  @Permissions(PERMISSIONS.MESSAGES_READ)
  @HttpCode(HttpStatus.OK)
  async fullAnalysis(
    @CurrentUser() user: JwtPayload,
    @Param('conversationId', ParseUUIDPipe) conversationId: string,
  ) {
    const [sentiment, categorization, intent, kbSuggestions, summary] = await Promise.all([
      this.analyzeSentiment.execute(conversationId, user.orgId),
      this.autoCategorize.execute(conversationId, user.orgId),
      this.detectIntent.execute(conversationId, user.orgId),
      this.kbRagSearch.suggestForConversation(conversationId, user.orgId),
      this.summarizeConversation.execute(conversationId, user.orgId),
    ]);

    return { sentiment, categorization, intent, kbSuggestions, summary };
  }
}
