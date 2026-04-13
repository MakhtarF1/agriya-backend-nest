import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { cartItemInclude, orderInclude, productInclude, purchaseRequestInclude } from '../../shared/constants/includes';
import { createOrderNumber } from '../../shared/utils/order-number.util';
import { AjouterPanierDto, ChangerStatutCommandeDto, ChangerStatutProduitDto, CreerCommandeDto, CreerDemandeAchatDto, CreerProduitDto, ModifierDemandeAchatDto, ModifierPanierDto, ModifierProduitDto } from './dto/marketplace.dto';

@Injectable()
export class MarketplaceService {
  constructor(private readonly prisma: PrismaService) {}

  async creerProduit(userId: string, dto: CreerProduitDto) {
    const produit = await this.prisma.product.create({
      data: {
        sellerUserId: userId,
        farmId: dto.exploitationId,
        name: dto.nom,
        category: dto.categorie,
        description: dto.description,
        unit: dto.unite || 'kg',
        price: dto.prix,
        quantityAvailable: dto.quantiteDisponible,
        currency: dto.devise || 'XOF',
        country: dto.pays || 'SN',
        city: dto.ville,
        status: (dto.statut || 'BROUILLON') as any,
        publishedAt: dto.statut === 'PUBLIE' ? new Date() : null,
      },
      include: productInclude,
    });

    if (dto.mediaIdPrincipal) {
      await this.prisma.productImage.create({
        data: { productId: produit.id, mediaId: dto.mediaIdPrincipal, isPrimary: true },
      });
    }

    return this.prisma.product.findUniqueOrThrow({ where: { id: produit.id }, include: productInclude });
  }

  listerProduits(filters: any = {}) {
    return this.prisma.product.findMany({
      where: {
        ...(filters.categorie ? { category: { contains: filters.categorie, mode: 'insensitive' } } : {}),
        ...(filters.ville ? { city: { contains: filters.ville, mode: 'insensitive' } } : {}),
        ...(filters.q ? {
          OR: [
            { name: { contains: filters.q, mode: 'insensitive' } },
            { description: { contains: filters.q, mode: 'insensitive' } },
          ],
        } : {}),
        ...(filters.statut ? { status: filters.statut } : { status: 'PUBLIE' }),
      },
      include: productInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  obtenirProduit(id: string) {
    return this.prisma.product.findUniqueOrThrow({ where: { id }, include: productInclude });
  }

  async modifierProduit(id: string, userId: string, role: string, dto: ModifierProduitDto) {
    await this.ensureProductOwner(id, userId, role);
    return this.prisma.product.update({
      where: { id },
      data: {
        name: dto.nom,
        category: dto.categorie,
        description: dto.description,
        unit: dto.unite,
        price: dto.prix,
        quantityAvailable: dto.quantiteDisponible,
        currency: dto.devise,
        country: dto.pays,
        city: dto.ville,
        status: dto.statut as any,
      },
      include: productInclude,
    });
  }

  async supprimerProduit(id: string, userId: string, role: string) {
    await this.ensureProductOwner(id, userId, role);
    return this.prisma.product.delete({ where: { id }, include: productInclude });
  }

  async changerStatutProduit(id: string, userId: string, role: string, dto: ChangerStatutProduitDto) {
    await this.ensureProductOwner(id, userId, role);
    return this.prisma.product.update({
      where: { id },
      data: { status: dto.statut as any, publishedAt: dto.statut === 'PUBLIE' ? new Date() : undefined },
      include: productInclude,
    });
  }

  mesProduits(userId: string) {
    return this.prisma.product.findMany({ where: { sellerUserId: userId }, include: productInclude, orderBy: { createdAt: 'desc' } });
  }

  async ajouterFavori(userId: string, productId: string) {
    await this.prisma.favorite.upsert({
      where: { userId_productId: { userId, productId } },
      update: {},
      create: { userId, productId },
    });
    return this.obtenirProduit(productId);
  }

  async retirerFavori(userId: string, productId: string) {
    await this.prisma.favorite.delete({ where: { userId_productId: { userId, productId } } }).catch(() => null);
    return { produitId: productId, favori: false };
  }

  creerDemandeAchat(userId: string, dto: CreerDemandeAchatDto) {
    return this.prisma.purchaseRequest.create({
      data: {
        buyerUserId: userId,
        organizationId: dto.organisationId,
        title: dto.titre,
        description: dto.description,
        category: dto.categorie,
        requestedQuantity: dto.quantiteDemandee,
        unit: dto.unite || 'kg',
        targetPrice: dto.prixCible,
        city: dto.ville,
        neededBy: dto.besoinAvant ? new Date(dto.besoinAvant) : undefined,
      },
      include: purchaseRequestInclude,
    });
  }

  listerDemandesAchat(userId?: string) {
    return this.prisma.purchaseRequest.findMany({ include: purchaseRequestInclude, orderBy: { createdAt: 'desc' } });
  }

  obtenirDemandeAchat(id: string) {
    return this.prisma.purchaseRequest.findUniqueOrThrow({ where: { id }, include: purchaseRequestInclude });
  }

  async modifierDemandeAchat(id: string, userId: string, role: string, dto: ModifierDemandeAchatDto) {
    await this.ensurePurchaseRequestOwner(id, userId, role);
    return this.prisma.purchaseRequest.update({
      where: { id },
      data: {
        title: dto.titre,
        description: dto.description,
        category: dto.categorie,
        requestedQuantity: dto.quantiteDemandee,
        unit: dto.unite,
        targetPrice: dto.prixCible,
        city: dto.ville,
        neededBy: dto.besoinAvant ? new Date(dto.besoinAvant) : undefined,
      },
      include: purchaseRequestInclude,
    });
  }

  async supprimerDemandeAchat(id: string, userId: string, role: string) {
    await this.ensurePurchaseRequestOwner(id, userId, role);
    return this.prisma.purchaseRequest.delete({ where: { id }, include: purchaseRequestInclude });
  }

  async ajouterPanier(userId: string, dto: AjouterPanierDto) {
    const produit = await this.prisma.product.findUniqueOrThrow({ where: { id: dto.produitId } });
    return this.prisma.cartItem.upsert({
      where: { userId_productId: { userId, productId: dto.produitId } },
      update: { quantity: dto.quantite, unit: dto.unite || produit.unit, unitPriceSnapshot: produit.price },
      create: {
        userId,
        productId: dto.produitId,
        quantity: dto.quantite,
        unit: dto.unite || produit.unit,
        unitPriceSnapshot: produit.price,
      },
      include: cartItemInclude,
    });
  }

  panier(userId: string) {
    return this.prisma.cartItem.findMany({ where: { userId }, include: cartItemInclude, orderBy: { createdAt: 'desc' } });
  }

  async modifierPanier(id: string, userId: string, dto: ModifierPanierDto) {
    const item = await this.prisma.cartItem.findFirstOrThrow({ where: { id, userId } });
    return this.prisma.cartItem.update({
      where: { id },
      data: { quantity: dto.quantite, unit: dto.unite || item.unit },
      include: cartItemInclude,
    });
  }

  async supprimerPanier(id: string, userId: string) {
    await this.prisma.cartItem.findFirstOrThrow({ where: { id, userId } });
    return this.prisma.cartItem.delete({ where: { id }, include: cartItemInclude });
  }

  async creerCommande(userId: string, dto: CreerCommandeDto) {
    const items = await this.prisma.cartItem.findMany({ where: { userId }, include: { product: true } });
    if (!items.length) throw new BadRequestException('Le panier est vide.');
    const sellerUserId = items[0].product.sellerUserId;
    const subtotal = items.reduce((sum, item) => sum + Number(item.unitPriceSnapshot) * item.quantity, 0);
    const fees = 0;
    const total = subtotal + fees;

    const order = await this.prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          buyerUserId: userId,
          organizationId: dto.organisationId,
          sellerUserId,
          orderNumber: createOrderNumber(),
          subtotal,
          fees,
          total,
          paymentStatus: 'EN_ATTENTE',
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              productNameSnapshot: item.product.name,
              quantity: item.quantity,
              unit: item.unit,
              unitPrice: item.unitPriceSnapshot,
              lineTotal: Number(item.unitPriceSnapshot) * item.quantity,
            })),
          },
        },
        include: orderInclude,
      });
      await tx.cartItem.deleteMany({ where: { userId } });
      return created;
    });

    return order;
  }

  commandes(userId: string, role: string) {
    return this.prisma.order.findMany({
      where: role === 'ADMIN' ? {} : { OR: [{ buyerUserId: userId }, { sellerUserId: userId }] },
      include: orderInclude,
      orderBy: { orderedAt: 'desc' },
    });
  }

  commande(id: string, userId: string, role: string) {
    return this.prisma.order.findFirstOrThrow({
      where: role === 'ADMIN' ? { id } : { id, OR: [{ buyerUserId: userId }, { sellerUserId: userId }] },
      include: orderInclude,
    });
  }

  async annulerCommande(id: string, userId: string, role: string) {
    const commande = await this.commande(id, userId, role);
    if (commande.buyerUserId !== userId && role !== 'ADMIN') throw new ForbiddenException('Seul l’acheteur peut annuler.');
    return this.prisma.order.update({ where: { id }, data: { status: 'ANNULEE' }, include: orderInclude });
  }

  async changerStatutCommande(id: string, userId: string, role: string, dto: ChangerStatutCommandeDto) {
    const commande = await this.commande(id, userId, role);
    if (commande.sellerUserId !== userId && role !== 'ADMIN') throw new ForbiddenException('Seul le vendeur peut mettre à jour le statut.');
    return this.prisma.order.update({ where: { id }, data: { status: dto.statut as any }, include: orderInclude });
  }

  ventes(userId: string) {
    return this.prisma.order.findMany({ where: { sellerUserId: userId }, include: orderInclude, orderBy: { orderedAt: 'desc' } });
  }

  private async ensureProductOwner(id: string, userId: string, role: string) {
    const product = await this.prisma.product.findUniqueOrThrow({ where: { id } });
    if (product.sellerUserId !== userId && role !== 'ADMIN') throw new ForbiddenException('Vous ne pouvez pas modifier ce produit.');
  }

  private async ensurePurchaseRequestOwner(id: string, userId: string, role: string) {
    const pr = await this.prisma.purchaseRequest.findUniqueOrThrow({ where: { id } });
    if (pr.buyerUserId !== userId && role !== 'ADMIN') throw new ForbiddenException('Vous ne pouvez pas modifier cette demande.');
  }
}
