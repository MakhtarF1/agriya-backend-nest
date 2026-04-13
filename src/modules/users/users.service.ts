import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { userInclude } from '../../shared/constants/includes';
import { ChangerLangueDto, ChangerPaysDto, ChangerStatutUtilisateurDto, MettreAJourUtilisateurDto } from './dto/users.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  moi(userId: string) {
    return this.prisma.user.findUniqueOrThrow({ where: { id: userId }, include: userInclude });
  }

  async mettreAJourMoi(userId: string, dto: MettreAJourUtilisateurDto) {
    const existing = await this.prisma.user.findUnique({ where: { id: userId }, include: { profile: true } });
    if (!existing) throw new NotFoundException('Utilisateur introuvable.');
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        phone: dto.telephone ?? existing.phone,
        profile: {
          upsert: {
            create: {
              fullName: dto.nomComplet || existing.email,
              bio: dto.bio,
              city: dto.ville,
              region: dto.region,
              isProducer: dto.isProducer ?? true,
              isBuyer: dto.isBuyer ?? false,
            },
            update: {
              fullName: dto.nomComplet,
              bio: dto.bio,
              city: dto.ville,
              region: dto.region,
              isProducer: dto.isProducer,
              isBuyer: dto.isBuyer,
            },
          },
        },
      },
      include: userInclude,
    });
  }

  changerLangue(userId: string, dto: ChangerLangueDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { language: dto.langue, profile: { update: { preferredLanguage: dto.langue } } },
      include: userInclude,
    });
  }

  changerPays(userId: string, dto: ChangerPaysDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { country: dto.pays },
      include: userInclude,
    });
  }

  lister(role?: string, statut?: string) {
    return this.prisma.user.findMany({
      where: {
        ...(role ? { role: role as any } : {}),
        ...(statut ? { status: statut as any } : {}),
      },
      include: userInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  obtenir(id: string) {
    return this.prisma.user.findUniqueOrThrow({ where: { id }, include: userInclude });
  }

  changerStatut(id: string, dto: ChangerStatutUtilisateurDto) {
    return this.prisma.user.update({
      where: { id },
      data: { status: dto.statut, ...(dto.role ? { role: dto.role } : {}) },
      include: userInclude,
    });
  }
}
