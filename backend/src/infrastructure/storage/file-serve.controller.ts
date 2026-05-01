import {
  Controller,
  Get,
  Param,
  Res,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '@/modules/auth/interfaces/guards/jwt-auth.guard';
import { Public } from '@/common/decorators';
import { join, extname } from 'path';
import { existsSync, createReadStream } from 'fs';

const MIME_MAP: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.mp4': 'video/mp4',
  '.mpeg': 'video/mpeg',
  '.webm': 'video/webm',
  '.3gpp': 'video/3gpp',
  '.mp3': 'audio/mpeg',
  '.ogg': 'audio/ogg',
  '.wav': 'audio/wav',
  '.aac': 'audio/aac',
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xls': 'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.txt': 'text/plain',
  '.csv': 'text/csv',
};

// UUID pattern: 8-4-4-4-12 hex chars, optionally followed by an extension
const SAFE_FILENAME = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.[a-z0-9]+$/i;

@Controller('files')
@UseGuards(JwtAuthGuard)
export class FileServeController {
  private readonly uploadsDir = join(process.cwd(), 'uploads');

  @Public()
  @Get(':filename')
  async serveFile(
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    // Strict filename validation — only UUID-based names with known extensions
    if (!SAFE_FILENAME.test(filename)) {
      throw new NotFoundException('File not found');
    }

    const filePath = join(this.uploadsDir, filename);

    // Prevent path traversal — resolved path must be within uploads dir
    if (!filePath.startsWith(this.uploadsDir)) {
      throw new NotFoundException('File not found');
    }

    if (!existsSync(filePath)) {
      throw new NotFoundException('File not found');
    }

    const ext = extname(filename).toLowerCase();
    const contentType = MIME_MAP[ext] || 'application/octet-stream';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'private, max-age=3600');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    createReadStream(filePath).pipe(res);
  }
}
