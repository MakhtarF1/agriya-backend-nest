import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { paymentInclude, subscriptionInclude } from '../../shared/constants/includes';
import { CreerAbonnementDto, InitierPaiementDto, VerifierPaiementDto } from './dto/billing.dto';

@Injectable()
export class BillingService {
  constructor(private readonly prisma: PrismaService) {}

  plans() {
    return this.prisma.subscriptionPlan.findMany({ where: { isActive: true }, orderBy: { monthlyPrice: 'asc' } });
  }

  async creerAbonnement(userId: string, dto: CreerAbonnementDto) {
    const plan = await this.prisma.subscriptionPlan.findUniqueOrThrow({ where: { id: dto.planId } });
    if (dto.organisationId) {
      const member = await this.prisma.organizationMember.findFirst({ where: { organizationId: dto.organisationId, userId } });
      if (!member) throw new BadRequestException('Vous ne faites pas partie de cette organisation.');
    }

    return this.prisma.subscription.create({
      data: {
        userId: dto.organisationId ? undefined : userId,
        organizationId: dto.organisationId,
        planId: dto.planId,
        status: 'ACTIVE',
        startedAt: new Date(),
        endsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
        autoRenew: !!dto.autoRenew,
        quotaStateJson: plan.quotasJson || {},
      },
      include: subscriptionInclude,
    });
  }

  async abonnementActif(userId: string) {
    const membership = await this.prisma.organizationMember.findFirst({ where: { userId } });
    return this.prisma.subscription.findFirst({
      where: {
        status: 'ACTIVE',
        OR: [
          { userId },
          ...(membership ? [{ organizationId: membership.organizationId }] : []),
        ],
      },
      include: subscriptionInclude,
      orderBy: { startedAt: 'desc' },
    });
  }

  async annuler(userId: string) {
    const subscription = await this.prisma.subscription.findFirstOrThrow({ where: { userId, status: 'ACTIVE' } });
    return this.prisma.subscription.update({
      where: { id: subscription.id },
      data: { autoRenew: false, status: 'ANNULEE' },
      include: subscriptionInclude,
    });
  }

  async renouveler(userId: string) {
    const subscription = await this.prisma.subscription.findFirstOrThrow({ where: { userId }, orderBy: { startedAt: 'desc' } });
    return this.prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'ACTIVE',
        startedAt: new Date(),
        endsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
        autoRenew: true,
      },
      include: subscriptionInclude,
    });
  }

  historique(userId: string) {
    return this.prisma.subscription.findMany({ where: { userId }, include: subscriptionInclude, orderBy: { startedAt: 'desc' } });
  }

  async initierPaiement(userId: string, dto: InitierPaiementDto) {
    let subscriptionId = dto.abonnementId;
    if (!subscriptionId) {
      const active = await this.abonnementActif(userId);
      subscriptionId = active?.id;
    }
    const subscription = subscriptionId
      ? await this.prisma.subscription.findUniqueOrThrow({ where: { id: subscriptionId }, include: { plan: true } })
      : null;
    const amount = subscription ? subscription.plan.monthlyPrice : 0;
    return this.prisma.payment.create({
      data: {
        subscriptionId: subscription?.id,
        userId,
        provider: dto.provider,
        providerRef: `PAY-${Date.now()}`,
        amount,
        currency: subscription?.plan.currency || 'XOF',
        status: 'EN_ATTENTE',
        rawPayloadJson: { provider: dto.provider, stage: 'initiated' },
      },
      include: paymentInclude,
    });
  }

  async webhook(payload: any) {
    if (!payload?.providerRef) return { recu: true, traite: false };
    const status = payload.status || 'PAYE';
    const payment = await this.prisma.payment.update({
      where: { providerRef: payload.providerRef },
      data: { status, paidAt: status === 'PAYE' ? new Date() : undefined, rawPayloadJson: payload },
      include: paymentInclude,
    });
    if (payment.subscriptionId && status === 'PAYE') {
      await this.prisma.subscription.update({ where: { id: payment.subscriptionId }, data: { status: 'ACTIVE' } });
    }
    return payment;
  }

  paiements(userId: string) {
    return this.prisma.payment.findMany({ where: { userId }, include: paymentInclude, orderBy: { createdAt: 'desc' } });
  }

  paiement(id: string, userId: string, role: string) {
    return this.prisma.payment.findFirstOrThrow({ where: role === 'ADMIN' ? { id } : { id, userId }, include: paymentInclude });
  }

  async verifier(userId: string, role: string, dto: VerifierPaiementDto) {
    const payment = await this.paiement(dto.paiementId, userId, role);
    const status = dto.statut || 'PAYE';
    const updated = await this.prisma.payment.update({
      where: { id: payment.id },
      data: { status: status as any, paidAt: status === 'PAYE' ? new Date() : undefined },
      include: paymentInclude,
    });
    if (updated.subscriptionId && status === 'PAYE') {
      await this.prisma.subscription.update({ where: { id: updated.subscriptionId }, data: { status: 'ACTIVE' } });
    }
    return updated;
  }
}
