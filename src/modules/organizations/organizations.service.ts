import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { makeSlug } from '../../shared/utils/slug.util';
import { organizationInclude } from '../../shared/constants/includes';
import { AjouterMembreDto, ChangerRoleMembreDto, CreerOrganisationDto, MettreAJourOrganisationDto } from './dto/organizations.dto';

@Injectable()
export class OrganizationsService {
  constructor(private readonly prisma: PrismaService) {}

  async creer(ownerUserId: string, dto: CreerOrganisationDto) {
    const slugBase = makeSlug(dto.nom);
    const slug = `${slugBase}-${Math.random().toString(36).slice(2, 6)}`;
    const organisation = await this.prisma.organization.create({
      data: {
        ownerUserId,
        name: dto.nom,
        slug,
        sector: dto.secteur,
        country: dto.pays || 'SN',
        city: dto.ville,
        address: dto.adresse,
        phone: dto.telephone,
        members: {
          create: {
            userId: ownerUserId,
            memberRole: 'OWNER',
            joinedAt: new Date(),
            status: 'ACTIVE',
          },
        },
      },
      include: organizationInclude,
    });
    return organisation;
  }

  async moi(userId: string) {
    const member = await this.prisma.organizationMember.findFirst({
      where: { userId },
      include: { organization: { include: organizationInclude } },
    });
    return member?.organization || null;
  }

  async mettreAJour(organizationId: string, requesterId: string, dto: MettreAJourOrganisationDto) {
    await this.assertOrganizationAdmin(organizationId, requesterId);
    return this.prisma.organization.update({
      where: { id: organizationId },
      data: {
        name: dto.nom,
        sector: dto.secteur,
        country: dto.pays,
        city: dto.ville,
        address: dto.adresse,
        phone: dto.telephone,
      },
      include: organizationInclude,
    });
  }

  async ajouterMembre(organizationId: string, requesterId: string, dto: AjouterMembreDto) {
    await this.assertOrganizationAdmin(organizationId, requesterId);
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new NotFoundException('Utilisateur introuvable.');
    return this.prisma.organizationMember.upsert({
      where: {
        organizationId_userId: {
          organizationId,
          userId: user.id,
        },
      },
      update: {
        memberRole: dto.role as any,
        status: 'ACTIVE',
        joinedAt: new Date(),
      },
      create: {
        organizationId,
        userId: user.id,
        memberRole: (dto.role || 'MEMBRE') as any,
        invitedBy: requesterId,
        invitedAt: new Date(),
        joinedAt: new Date(),
        status: 'ACTIVE',
      },
      include: { user: { include: { profile: true } }, organization: true },
    });
  }

  async listerMembres(organizationId: string, requesterId: string) {
    await this.assertOrganizationMember(organizationId, requesterId);
    return this.prisma.organizationMember.findMany({
      where: { organizationId },
      include: { user: { include: { profile: true } }, organization: true },
      orderBy: { joinedAt: 'asc' },
    });
  }

  async retirerMembre(organizationId: string, memberId: string, requesterId: string) {
    await this.assertOrganizationAdmin(organizationId, requesterId);
    return this.prisma.organizationMember.delete({ where: { id: memberId } });
  }

  async changerRole(organizationId: string, memberId: string, requesterId: string, dto: ChangerRoleMembreDto) {
    await this.assertOrganizationAdmin(organizationId, requesterId);
    return this.prisma.organizationMember.update({
      where: { id: memberId },
      data: { memberRole: dto.role as any },
      include: { user: { include: { profile: true } }, organization: true },
    });
  }

  private async assertOrganizationAdmin(organizationId: string, requesterId: string) {
    const member = await this.prisma.organizationMember.findFirst({ where: { organizationId, userId: requesterId } });
    if (!member || !['OWNER', 'ADMIN'].includes(member.memberRole)) {
      throw new ForbiddenException('Action réservée aux administrateurs de l’organisation.');
    }
  }

  private async assertOrganizationMember(organizationId: string, requesterId: string) {
    const member = await this.prisma.organizationMember.findFirst({ where: { organizationId, userId: requesterId } });
    if (!member) throw new ForbiddenException('Vous ne faites pas partie de cette organisation.');
  }
}
