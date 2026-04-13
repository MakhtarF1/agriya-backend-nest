import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { cropInclude, diagnosisInclude, farmInclude, plotInclude } from '../../shared/constants/includes';
import { CreerCultureDto, CreerDiagnosticDto, CreerExploitationDto, CreerParcelleDto, ModifierCultureDto, ModifierDiagnosticDto, ModifierExploitationDto, ModifierParcelleDto } from './dto/agriculture.dto';

@Injectable()
export class AgricultureService {
  constructor(private readonly prisma: PrismaService) {}

  creerExploitation(userId: string, dto: CreerExploitationDto) {
    return this.prisma.farm.create({
      data: {
        ownerUserId: userId,
        name: dto.nom,
        country: dto.pays || 'SN',
        region: dto.region,
        city: dto.ville,
        locationText: dto.localisation,
        notes: dto.notes,
      },
      include: farmInclude,
    });
  }

  listerExploitations(userId: string) {
    return this.prisma.farm.findMany({ where: { ownerUserId: userId }, include: farmInclude, orderBy: { createdAt: 'desc' } });
  }

  obtenirExploitation(id: string, userId: string) {
    return this.ensureFarmOwner(id, userId).then(() => this.prisma.farm.findUniqueOrThrow({ where: { id }, include: farmInclude }));
  }

  async modifierExploitation(id: string, userId: string, dto: ModifierExploitationDto) {
    await this.ensureFarmOwner(id, userId);
    return this.prisma.farm.update({
      where: { id },
      data: {
        name: dto.nom,
        country: dto.pays,
        region: dto.region,
        city: dto.ville,
        locationText: dto.localisation,
        notes: dto.notes,
      },
      include: farmInclude,
    });
  }

  async supprimerExploitation(id: string, userId: string) {
    await this.ensureFarmOwner(id, userId);
    return this.prisma.farm.delete({ where: { id }, include: farmInclude });
  }

  async creerParcelle(userId: string, dto: CreerParcelleDto) {
    await this.ensureFarmOwner(dto.exploitationId, userId);
    return this.prisma.plot.create({
      data: {
        farmId: dto.exploitationId,
        name: dto.nom,
        surfaceValue: dto.surfaceValeur,
        surfaceUnit: dto.surfaceUnite,
        soilNotes: dto.notesSol,
        irrigationType: dto.typeIrrigation,
        locationText: dto.localisation,
      },
      include: plotInclude,
    });
  }

  listerParcelles(userId: string) {
    return this.prisma.plot.findMany({ where: { farm: { ownerUserId: userId } }, include: plotInclude, orderBy: { createdAt: 'desc' } });
  }

  obtenirParcelle(id: string, userId: string) {
    return this.ensurePlotOwner(id, userId).then(() => this.prisma.plot.findUniqueOrThrow({ where: { id }, include: plotInclude }));
  }

  async modifierParcelle(id: string, userId: string, dto: ModifierParcelleDto) {
    await this.ensurePlotOwner(id, userId);
    return this.prisma.plot.update({
      where: { id },
      data: {
        name: dto.nom,
        surfaceValue: dto.surfaceValeur,
        surfaceUnit: dto.surfaceUnite,
        soilNotes: dto.notesSol,
        irrigationType: dto.typeIrrigation,
        locationText: dto.localisation,
      },
      include: plotInclude,
    });
  }

  async supprimerParcelle(id: string, userId: string) {
    await this.ensurePlotOwner(id, userId);
    return this.prisma.plot.delete({ where: { id }, include: plotInclude });
  }

  async creerCulture(userId: string, dto: CreerCultureDto) {
    await this.ensurePlotOwner(dto.parcelleId, userId);
    return this.prisma.crop.create({
      data: {
        plotId: dto.parcelleId,
        cropName: dto.nomCulture,
        variety: dto.variete,
        seasonLabel: dto.saison,
        sowingDate: dto.dateSemis ? new Date(dto.dateSemis) : undefined,
        expectedHarvestDate: dto.dateRecoltePrevue ? new Date(dto.dateRecoltePrevue) : undefined,
        growthStage: dto.stadeCroissance,
        status: 'EN_COURS',
      },
      include: cropInclude,
    });
  }

  listerCultures(userId: string) {
    return this.prisma.crop.findMany({ where: { plot: { farm: { ownerUserId: userId } } }, include: cropInclude, orderBy: { createdAt: 'desc' } });
  }

  obtenirCulture(id: string, userId: string) {
    return this.ensureCropOwner(id, userId).then(() => this.prisma.crop.findUniqueOrThrow({ where: { id }, include: cropInclude }));
  }

  async modifierCulture(id: string, userId: string, dto: ModifierCultureDto) {
    await this.ensureCropOwner(id, userId);
    return this.prisma.crop.update({
      where: { id },
      data: {
        cropName: dto.nomCulture,
        variety: dto.variete,
        seasonLabel: dto.saison,
        sowingDate: dto.dateSemis ? new Date(dto.dateSemis) : undefined,
        expectedHarvestDate: dto.dateRecoltePrevue ? new Date(dto.dateRecoltePrevue) : undefined,
        growthStage: dto.stadeCroissance,
      },
      include: cropInclude,
    });
  }

  async supprimerCulture(id: string, userId: string) {
    await this.ensureCropOwner(id, userId);
    return this.prisma.crop.delete({ where: { id }, include: cropInclude });
  }

  async creerDiagnostic(userId: string, dto: CreerDiagnosticDto) {
    if (dto.parcelleId) await this.ensurePlotOwner(dto.parcelleId, userId);
    if (dto.cultureId) await this.ensureCropOwner(dto.cultureId, userId);
    const diagnostic = await this.prisma.diagnosis.create({
      data: {
        userId,
        plotId: dto.parcelleId,
        cropId: dto.cultureId,
        conversationId: dto.conversationId,
        diagnosisType: dto.typeDiagnostic,
        confidenceScore: dto.scoreConfiance,
        urgencyLevel: dto.niveauUrgence as any,
        summary: dto.resume,
        recommendationsJson: dto.recommandations || [],
      },
      include: diagnosisInclude,
    });

    if (dto.mediaIds?.length) {
      await this.prisma.diagnosisMedia.createMany({
        data: dto.mediaIds.map((mediaId) => ({ diagnosisId: diagnostic.id, mediaId })),
        skipDuplicates: true,
      });
    }

    return this.prisma.diagnosis.findUniqueOrThrow({ where: { id: diagnostic.id }, include: diagnosisInclude });
  }

  listerDiagnostics(userId: string) {
    return this.prisma.diagnosis.findMany({ where: { userId }, include: diagnosisInclude, orderBy: { createdAt: 'desc' } });
  }

  obtenirDiagnostic(id: string, userId: string) {
    return this.ensureDiagnosisOwner(id, userId).then(() => this.prisma.diagnosis.findUniqueOrThrow({ where: { id }, include: diagnosisInclude }));
  }

  obtenirMediasDiagnostic(id: string, userId: string) {
    return this.ensureDiagnosisOwner(id, userId).then(() =>
      this.prisma.diagnosisMedia.findMany({ where: { diagnosisId: id }, include: { media: true } }),
    );
  }

  async modifierDiagnostic(id: string, userId: string, dto: ModifierDiagnosticDto) {
    await this.ensureDiagnosisOwner(id, userId);
    return this.prisma.diagnosis.update({
      where: { id },
      data: {
        diagnosisType: dto.typeDiagnostic,
        confidenceScore: dto.scoreConfiance,
        urgencyLevel: dto.niveauUrgence as any,
        summary: dto.resume,
        recommendationsJson: dto.recommandations || [],
      },
      include: diagnosisInclude,
    });
  }

  async supprimerDiagnostic(id: string, userId: string, isAdmin = false) {
    if (!isAdmin) await this.ensureDiagnosisOwner(id, userId);
    return this.prisma.diagnosis.delete({ where: { id }, include: diagnosisInclude });
  }

  async statistiques(userId: string) {
    const [diagnostics, exploitations, parcelles, cultures] = await Promise.all([
      this.prisma.diagnosis.count({ where: { userId } }),
      this.prisma.farm.count({ where: { ownerUserId: userId } }),
      this.prisma.plot.count({ where: { farm: { ownerUserId: userId } } }),
      this.prisma.crop.count({ where: { plot: { farm: { ownerUserId: userId } } } }),
    ]);
    return { diagnostics, exploitations, parcelles, cultures };
  }

  private async ensureFarmOwner(id: string, userId: string) {
    const farm = await this.prisma.farm.findFirst({ where: { id, ownerUserId: userId } });
    if (!farm) throw new ForbiddenException('Accès interdit à cette exploitation.');
  }
  private async ensurePlotOwner(id: string, userId: string) {
    const plot = await this.prisma.plot.findFirst({ where: { id, farm: { ownerUserId: userId } } });
    if (!plot) throw new ForbiddenException('Accès interdit à cette parcelle.');
  }
  private async ensureCropOwner(id: string, userId: string) {
    const crop = await this.prisma.crop.findFirst({ where: { id, plot: { farm: { ownerUserId: userId } } } });
    if (!crop) throw new ForbiddenException('Accès interdit à cette culture.');
  }
  private async ensureDiagnosisOwner(id: string, userId: string) {
    const diagnosis = await this.prisma.diagnosis.findFirst({ where: { id, userId } });
    if (!diagnosis) throw new ForbiddenException('Accès interdit à ce diagnostic.');
  }
}
