import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { orderInclude, paymentInclude, productInclude, subscriptionInclude, userInclude } from '../../shared/constants/includes';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async dashboard() {
    const [users, products, orders, payments, subscriptions] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.product.count(),
      this.prisma.order.count(),
      this.prisma.payment.count(),
      this.prisma.subscription.count(),
    ]);
    return { users, products, orders, payments, subscriptions };
  }

  users() {
    return this.prisma.user.findMany({ include: userInclude, orderBy: { createdAt: 'desc' } });
  }

  products() {
    return this.prisma.product.findMany({ include: productInclude, orderBy: { createdAt: 'desc' } });
  }

  orders() {
    return this.prisma.order.findMany({ include: orderInclude, orderBy: { orderedAt: 'desc' } });
  }

  payments() {
    return this.prisma.payment.findMany({ include: paymentInclude, orderBy: { createdAt: 'desc' } });
  }

  subscriptions() {
    return this.prisma.subscription.findMany({ include: subscriptionInclude, orderBy: { startedAt: 'desc' } });
  }

  moderateProduct(id: string, statut: string) {
    return this.prisma.product.update({ where: { id }, data: { status: statut as any }, include: productInclude });
  }

  suspendUser(id: string) {
    return this.prisma.user.update({ where: { id }, data: { status: 'SUSPENDU' }, include: userInclude });
  }

  async stats() {
    const [diagnostics, tasks, notifications, organizations] = await Promise.all([
      this.prisma.diagnosis.count(),
      this.prisma.task.count(),
      this.prisma.notification.count(),
      this.prisma.organization.count(),
    ]);
    return { diagnostics, tasks, notifications, organizations };
  }
}
