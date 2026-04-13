import {
  IsString, IsNotEmpty, IsEnum, IsOptional, IsInt, Min, MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TicketCategory, TicketPriority, TicketStatus } from '@prisma/client';

export class CreateTicketDto {
  @IsString() @IsNotEmpty() @MaxLength(255)
  title: string;

  @IsString() @IsNotEmpty()
  description: string;

  @IsEnum(TicketCategory)
  category: TicketCategory;

  @IsOptional() @IsEnum(TicketPriority)
  priority?: TicketPriority;
}

export class ReplyToTicketDto {
  @IsString() @IsNotEmpty()
  body: string;
}

export class UpdateTicketStatusDto {
  @IsEnum(TicketStatus)
  status: TicketStatus;
}

export class ListTicketsQueryDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  page?: number;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  limit?: number;

  @IsOptional() @IsEnum(TicketStatus)
  status?: TicketStatus;

  @IsOptional() @IsEnum(TicketCategory)
  category?: TicketCategory;

  @IsOptional() @IsEnum(TicketPriority)
  priority?: TicketPriority;

  @IsOptional() @IsString()
  orgId?: string;
}
