import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
  ParseUUIDPipe, NotFoundException, UseInterceptors, UploadedFile, HttpCode, HttpStatus, Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuid } from 'uuid';
import * as path from 'path';
import { Public } from '@/common/decorators/public.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Permissions } from '@/common/decorators/permissions.decorator';
import { PERMISSIONS } from '@/modules/rbac/domain/permissions.constants';
import { KbRepository } from '../../infrastructure/repositories/kb.repository';
import { DocumentProcessorService } from '../../domain/services/document-processor.service';
import { CreateCategoryDto, CreateArticleDto, UpdateArticleDto } from '../../application/dto';

/* ─── Admin KB Controller (authenticated) ─── */

const ALLOWED_DOC_TYPES = [
  'application/pdf',
  'text/plain',
  'text/csv',
  'text/markdown',
];

@Controller('kb')
export class KbController {
  private readonly logger = new Logger(KbController.name);

  constructor(
    private readonly repo: KbRepository,
    private readonly docProcessor: DocumentProcessorService,
  ) {}

  // ─── Categories ───

  @Post('categories')
  @Permissions(PERMISSIONS.SETTINGS_MANAGE)
  async createCategory(@CurrentUser('orgId') orgId: string, @Body() dto: CreateCategoryDto) {
    return this.repo.createCategory({ orgId, ...dto });
  }

  @Get('categories')
  @Permissions(PERMISSIONS.SETTINGS_READ)
  async listCategories(@CurrentUser('orgId') orgId: string) {
    return this.repo.findCategoriesByOrg(orgId);
  }

  @Delete('categories/:id')
  @Permissions(PERMISSIONS.SETTINGS_MANAGE)
  async deleteCategory(@CurrentUser('orgId') orgId: string, @Param('id', ParseUUIDPipe) id: string) {
    await this.repo.deleteCategory(id, orgId);
    return { deleted: true };
  }

  // ─── Articles ───

  @Post('articles')
  @Permissions(PERMISSIONS.SETTINGS_MANAGE)
  async createArticle(@CurrentUser('orgId') orgId: string, @CurrentUser('sub') userId: string, @Body() dto: CreateArticleDto) {
    return this.repo.createArticle({ orgId, authorId: userId, ...dto });
  }

  @Get('articles')
  @Permissions(PERMISSIONS.SETTINGS_READ)
  async listArticles(
    @CurrentUser('orgId') orgId: string,
    @Query('categoryId') categoryId?: string,
    @Query('isPublished') isPublished?: string,
    @Query('search') search?: string,
    @Query('take') take?: string,
    @Query('skip') skip?: string,
  ) {
    return this.repo.findByOrgPaginated(orgId, {
      categoryId,
      isPublished: isPublished === 'true' ? true : isPublished === 'false' ? false : undefined,
      search,
      take: take ? parseInt(take, 10) : 20,
      skip: skip ? parseInt(skip, 10) : 0,
    });
  }

  @Get('articles/:id')
  @Permissions(PERMISSIONS.SETTINGS_READ)
  async getArticle(@CurrentUser('orgId') orgId: string, @Param('id', ParseUUIDPipe) id: string) {
    const article = await this.repo.findByIdAndOrg(id, orgId);
    if (!article) throw new NotFoundException('Article not found');
    return article;
  }

  @Patch('articles/:id')
  @Permissions(PERMISSIONS.SETTINGS_MANAGE)
  async updateArticle(
    @CurrentUser('orgId') orgId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateArticleDto,
  ) {
    const article = await this.repo.findByIdAndOrg(id, orgId);
    if (!article) throw new NotFoundException('Article not found');
    await this.repo.updateArticle(id, orgId, dto as any);
    return this.repo.findByIdAndOrg(id, orgId);
  }

  @Delete('articles/:id')
  @Permissions(PERMISSIONS.SETTINGS_MANAGE)
  async deleteArticle(@CurrentUser('orgId') orgId: string, @Param('id', ParseUUIDPipe) id: string) {
    await this.repo.softDelete(id, orgId);
    return { deleted: true };
  }

  @Post('articles/:id/helpful')
  @Permissions(PERMISSIONS.SETTINGS_READ)
  async markHelpful(@Param('id', ParseUUIDPipe) id: string) {
    await this.repo.incrementHelpfulCount(id);
    return { ok: true };
  }

  // ─── Documents ───

  @Post('documents/upload')
  @Permissions(PERMISSIONS.SETTINGS_MANAGE)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/documents',
        filename: (_req, file, cb) => {
          const ext = path.extname(file.originalname);
          cb(null, `${uuid()}${ext}`);
        },
      }),
      limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
      fileFilter: (_req, file, cb) => {
        cb(null, ALLOWED_DOC_TYPES.includes(file.mimetype));
      },
    }),
  )
  @HttpCode(HttpStatus.CREATED)
  async uploadDocument(
    @CurrentUser('orgId') orgId: string,
    @CurrentUser('sub') userId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('title') title?: string,
    @Body('flowId') flowId?: string,
  ) {
    if (!file) throw new NotFoundException('No file uploaded or unsupported file type. Allowed: PDF, TXT, CSV, Markdown');

    // Create document record
    const doc = await this.repo.createDocument({
      orgId,
      flowId: flowId || undefined,
      title: title || file.originalname,
      filename: file.filename,
      fileUrl: `/uploads/documents/${file.filename}`,
      contentType: file.mimetype,
      fileSize: file.size,
      uploadedById: userId,
    });

    // Extract text (async but we wait for it)
    try {
      const extractedText = await this.docProcessor.extractText(file.path, file.mimetype);
      await this.repo.updateDocumentStatus(doc.id, 'READY', extractedText);
      this.logger.log(`Document ${doc.id} processed: ${extractedText.length} chars extracted`);
      return { ...doc, status: 'READY', extractedTextLength: extractedText.length };
    } catch (error) {
      await this.repo.updateDocumentStatus(doc.id, 'FAILED');
      this.logger.error(`Document ${doc.id} processing failed: ${error.message}`);
      return { ...doc, status: 'FAILED' };
    }
  }

  @Get('documents')
  @Permissions(PERMISSIONS.SETTINGS_READ)
  async listDocuments(
    @CurrentUser('orgId') orgId: string,
    @Query('flowId') flowId?: string,
  ) {
    return this.repo.findDocumentsByOrg(orgId, flowId);
  }

  @Delete('documents/:id')
  @Permissions(PERMISSIONS.SETTINGS_MANAGE)
  @HttpCode(HttpStatus.OK)
  async deleteDocument(
    @CurrentUser('orgId') orgId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.repo.softDeleteDocument(id, orgId);
    return { deleted: true };
  }
}

/* ─── Public KB Controller (for widget/public help center) ─── */

@Controller('help')
@Public()
export class KbPublicController {
  constructor(private readonly repo: KbRepository) {}

  @Get(':orgSlug/search')
  async searchArticles(
    @Param('orgSlug') orgSlug: string,
    @Query('q') query: string,
  ) {
    if (!query?.trim()) return [];

    const orgId = await this.repo.resolveOrgIdBySlug(orgSlug);
    if (!orgId) throw new NotFoundException('Organization not found');

    return this.repo.searchPublicArticles(orgId, query);
  }
}
