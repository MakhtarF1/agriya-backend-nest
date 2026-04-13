import { Body, Controller, Get, Param, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { UploadedFileLike } from '../../shared/types/uploaded-file.type';
import { AiService } from './ai.service';
import { ChatIaDto, RecetteVersPanierDto, TtsDto } from './dto/ai.dto';
import { MediaService } from '../media/media.service';

@ApiTags('IA')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ia')
export class AiController {
  constructor(private readonly aiService: AiService, private readonly mediaService: MediaService) {}

  @Post('chat')
  chat(@CurrentUser('id') userId: string, @Body() dto: ChatIaDto) {
    return this.aiService.chat(userId, dto);
  }

  @Post('chat-audio')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async chatAudio(@CurrentUser('id') userId: string, @UploadedFile() file: UploadedFileLike, @Body('message') message: string) {
    const media = await this.mediaService.saveMedia(userId, file, 'AUDIO');
    return this.aiService.chatAvecMedia(userId, message || 'Message audio', media.id, 'AUDIO');
  }

  @Post('chat-image')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async chatImage(@CurrentUser('id') userId: string, @UploadedFile() file: UploadedFileLike, @Body('message') message: string) {
    const media = await this.mediaService.saveMedia(userId, file, 'IMAGE');
    return this.aiService.chatAvecMedia(userId, message || 'Image envoyée', media.id, 'IMAGE');
  }

  @Post('chat-video')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async chatVideo(@CurrentUser('id') userId: string, @UploadedFile() file: UploadedFileLike, @Body('message') message: string) {
    const media = await this.mediaService.saveMedia(userId, file, 'VIDEO');
    return this.aiService.chatAvecMedia(userId, message || 'Vidéo envoyée', media.id, 'VIDEO');
  }

  @Post('tts')
  tts(@Body() dto: TtsDto) {
    return this.aiService.tts(dto);
  }

  @Post('transcrire')
  transcrire(@Body('message') message: string, @Body('mediaId') mediaId: string) {
    return this.aiService.transcrire(message, mediaId);
  }

  @Get('conversations')
  conversations(@CurrentUser('id') userId: string) {
    return this.aiService.conversations(userId);
  }

  @Get('conversations/:id')
  conversation(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.aiService.conversation(id, userId);
  }

  @Post('conversations/:id/messages')
  ajouterMessage(@Param('id') id: string, @CurrentUser('id') userId: string, @Body() dto: any) {
    return this.aiService.ajouterMessage(userId, id, dto.message, dto.mediaId, dto.typeMessage);
  }

  @Post('recette-vers-panier')
  recetteVersPanier(@Body() dto: RecetteVersPanierDto) {
    return this.aiService.recetteVersPanier(dto);
  }
}
