import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { reminderInclude, taskInclude } from '../../shared/constants/includes';
import { CreerRappelDto, CreerTacheDto, ModifierTacheDto } from './dto/operations.dto';

@Injectable()
export class OperationsService {
  constructor(private readonly prisma: PrismaService) {}

  creerTache(userId: string, dto: CreerTacheDto) {
    return this.prisma.task.create({
      data: {
        userId,
        plotId: dto.parcelleId,
        cropId: dto.cultureId,
        sourceType: dto.sourceType || 'UTILISATEUR',
        title: dto.titre,
        description: dto.description,
        dueAt: dto.echeance ? new Date(dto.echeance) : undefined,
        priority: dto.priorite || 'MOYENNE',
      },
      include: taskInclude,
    });
  }

  listerTaches(userId: string) {
    return this.prisma.task.findMany({ where: { userId }, include: taskInclude, orderBy: { dueAt: 'asc' } });
  }

  tache(id: string, userId: string) {
    return this.prisma.task.findFirstOrThrow({ where: { id, userId }, include: taskInclude });
  }

  async modifierTache(id: string, userId: string, dto: ModifierTacheDto) {
    await this.tache(id, userId);
    return this.prisma.task.update({
      where: { id },
      data: {
        title: dto.titre,
        description: dto.description,
        dueAt: dto.echeance ? new Date(dto.echeance) : undefined,
        priority: dto.priorite,
        plotId: dto.parcelleId,
        cropId: dto.cultureId,
      },
      include: taskInclude,
    });
  }

  async terminerTache(id: string, userId: string) {
    await this.tache(id, userId);
    return this.prisma.task.update({ where: { id }, data: { status: 'TERMINEE', completedAt: new Date() }, include: taskInclude });
  }

  async supprimerTache(id: string, userId: string) {
    await this.tache(id, userId);
    return this.prisma.task.delete({ where: { id }, include: taskInclude });
  }

  calendrier(userId: string) {
    return Promise.all([
      this.prisma.task.findMany({ where: { userId }, include: taskInclude, orderBy: { dueAt: 'asc' } }),
      this.prisma.reminder.findMany({ where: { userId }, include: reminderInclude, orderBy: { remindAt: 'asc' } }),
      this.prisma.crop.findMany({ where: { plot: { farm: { ownerUserId: userId } } }, include: { plot: true }, orderBy: { expectedHarvestDate: 'asc' } }),
    ]).then(([taches, rappels, cultures]) => ({ taches, rappels, cultures }));
  }

  creerRappel(userId: string, dto: CreerRappelDto) {
    return this.prisma.reminder.create({
      data: {
        userId,
        taskId: dto.tacheId,
        remindAt: new Date(dto.rappelAt),
        channel: dto.canal || 'IN_APP',
      },
      include: reminderInclude,
    });
  }

  rappels(userId: string) {
    return this.prisma.reminder.findMany({ where: { userId }, include: reminderInclude, orderBy: { remindAt: 'asc' } });
  }

  notifications(userId: string) {
    return this.prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  }

  async lireNotification(userId: string, id: string) {
    const notif = await this.prisma.notification.findFirstOrThrow({ where: { id, userId } });
    return this.prisma.notification.update({ where: { id: notif.id }, data: { isRead: true, readAt: new Date() } });
  }

  toutLire(userId: string) {
    return this.prisma.notification.updateMany({ where: { userId }, data: { isRead: true, readAt: new Date() } });
  }

  async supprimerNotification(userId: string, id: string) {
    await this.prisma.notification.findFirstOrThrow({ where: { id, userId } });
    return this.prisma.notification.delete({ where: { id } });
  }
}
