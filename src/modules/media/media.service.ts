import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { TypeMedia } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { existsSync, mkdirSync, writeFileSync, unlinkSync } from 'fs';
import { extname, join } from 'path';
import { UploadedFileLike } from '../../shared/types/uploaded-file.type';

@Injectable()
export class MediaService {
  private readonly storageRoot: string;

  constructor(private readonly prisma: PrismaService, private readonly config: ConfigService) {
    this.storageRoot = this.config.get<string>('mediaStoragePath') || 'storage';
    if (!existsSync(this.storageRoot)) mkdirSync(this.storageRoot, { recursive: true });
  }

  async saveMedia(ownerUserId: string, file: UploadedFileLike, type: TypeMedia) {
    if (!file?.buffer || !file?.originalname || !file?.mimetype) {
      throw new BadRequestException('Fichier média invalide ou absent.');
    }

    const folder = join(this.storageRoot, type.toLowerCase());
    if (!existsSync(folder)) mkdirSync(folder, { recursive: true });

    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${extname(file.originalname) || ''}`;
    const fullPath = join(folder, filename);
    writeFileSync(fullPath, file.buffer);

    return this.prisma.mediaFile.create({
      data: {
        ownerUserId,
        fileType: type,
        mimeType: file.mimetype,
        storageKey: fullPath,
        publicUrl: `/${fullPath.replace(/\\/g, '/')}`,
        sizeBytes: file.size,
      },
    });
  }

  async getMedia(id: string, requesterId: string, requesterRole: string) {
    const media = await this.prisma.mediaFile.findUnique({ where: { id } });
    if (!media) throw new NotFoundException('Média introuvable.');
    if (media.ownerUserId !== requesterId && requesterRole !== 'ADMIN') {
      throw new ForbiddenException('Accès interdit à ce média.');
    }
    return media;
  }

  async deleteMedia(id: string, requesterId: string, requesterRole: string) {
    const media = await this.getMedia(id, requesterId, requesterRole);
    if (existsSync(media.storageKey)) unlinkSync(media.storageKey);
    return this.prisma.mediaFile.delete({ where: { id } });
  }
}
