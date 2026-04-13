import { Controller, Delete, Get, Param, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { UploadedFileLike } from '../../shared/types/uploaded-file.type';
import { MediaService } from './media.service';

@ApiTags('Médias')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('medias')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload-image')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  uploadImage(@CurrentUser('id') userId: string, @UploadedFile() file: UploadedFileLike) {
    return this.mediaService.saveMedia(userId, file, 'IMAGE');
  }

  @Post('upload-audio')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  uploadAudio(@CurrentUser('id') userId: string, @UploadedFile() file: UploadedFileLike) {
    return this.mediaService.saveMedia(userId, file, 'AUDIO');
  }

  @Post('upload-video')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  uploadVideo(@CurrentUser('id') userId: string, @UploadedFile() file: UploadedFileLike) {
    return this.mediaService.saveMedia(userId, file, 'VIDEO');
  }

  @Get(':id')
  getMedia(@Param('id') id: string, @CurrentUser('id') userId: string, @CurrentUser('role') role: string) {
    return this.mediaService.getMedia(id, userId, role);
  }

  @Delete(':id')
  deleteMedia(@Param('id') id: string, @CurrentUser('id') userId: string, @CurrentUser('role') role: string) {
    return this.mediaService.deleteMedia(id, userId, role);
  }
}
