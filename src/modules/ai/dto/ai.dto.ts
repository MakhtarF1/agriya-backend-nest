import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class ChatIaDto {
  @ApiProperty()
  @IsString()
  message: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  conversationId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  langue?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pays?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  parcelleId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cultureId?: string;
}

export class TtsDto {
  @ApiProperty()
  @IsString()
  texte: string;
}

export class AjouterMessageConversationDto {
  @ApiProperty()
  @IsString()
  message: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  typeMessage?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mediaId?: string;
}

export class RecetteVersPanierDto {
  @ApiProperty()
  @IsString()
  besoin: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  ingredientsConnus?: string[];
}
