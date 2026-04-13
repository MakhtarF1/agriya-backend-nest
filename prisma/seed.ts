import { PrismaClient, RoleUtilisateur, StatutProduit, StatutTache } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD || 'Agriya2026!', 12);

  const plans = [
    {
      code: 'gratuit',
      name: 'Gratuit',
      audience: 'Tous',
      monthlyPrice: 0,
      quotasJson: { analysesMensuelles: 10, produitsPublies: 5 },
      featuresJson: { assistant: true, marketplace: true, historique: 'court' },
    },
    {
      code: 'premium-agriculteur',
      name: 'Premium Agriculteur',
      audience: 'Agriculteur',
      monthlyPrice: 3000,
      quotasJson: { analysesMensuelles: 500, produitsPublies: 100 },
      featuresJson: { assistant: true, calendrier: true, historique: 'complet', rappels: true },
    },
    {
      code: 'pro-entreprise',
      name: 'Pro Entreprise',
      audience: 'Compte pro',
      monthlyPrice: 15000,
      quotasJson: { analysesMensuelles: 1000, produitsPublies: 500, membres: 20 },
      featuresJson: { organisation: true, commandesRecurrentes: true, supportPrioritaire: true },
    },
  ];

  for (const plan of plans) {
    await prisma.subscriptionPlan.upsert({
      where: { code: plan.code },
      update: plan,
      create: plan,
    });
  }

  const admin = await prisma.user.upsert({
    where: { email: 'admin@agriya.sn' },
    update: { passwordHash: password, role: RoleUtilisateur.ADMIN },
    create: {
      email: 'admin@agriya.sn',
      passwordHash: password,
      role: RoleUtilisateur.ADMIN,
      country: 'SN',
      language: 'fr',
      profile: {
        create: {
          fullName: 'Admin AGRIYA',
          preferredLanguage: 'fr',
          isProducer: false,
          isBuyer: false,
          city: 'Dakar',
        },
      },
    },
    include: { profile: true },
  });

  const agriculteur = await prisma.user.upsert({
    where: { email: 'agriculteur@agriya.sn' },
    update: { passwordHash: password },
    create: {
      email: 'agriculteur@agriya.sn',
      passwordHash: password,
      role: RoleUtilisateur.AGRICULTEUR,
      country: 'SN',
      language: 'fr',
      profile: {
        create: {
          fullName: 'Mamadou Ndiaye',
          preferredLanguage: 'fr',
          isProducer: true,
          isBuyer: false,
          city: 'Thiès',
          region: 'Thiès',
        },
      },
    },
    include: { profile: true },
  });

  const acheteur = await prisma.user.upsert({
    where: { email: 'acheteur@agriya.sn' },
    update: { passwordHash: password },
    create: {
      email: 'acheteur@agriya.sn',
      passwordHash: password,
      role: RoleUtilisateur.ACHETEUR,
      country: 'SN',
      language: 'fr',
      profile: {
        create: {
          fullName: 'Awa Fall',
          preferredLanguage: 'fr',
          isProducer: false,
          isBuyer: true,
          city: 'Dakar',
          region: 'Dakar',
        },
      },
    },
    include: { profile: true },
  });

  const comptePro = await prisma.user.upsert({
    where: { email: 'pro@agriya.sn' },
    update: { passwordHash: password },
    create: {
      email: 'pro@agriya.sn',
      passwordHash: password,
      role: RoleUtilisateur.COMPTE_PRO,
      country: 'SN',
      language: 'fr',
      profile: {
        create: {
          fullName: 'Chef Restaurant Ndar',
          preferredLanguage: 'fr',
          isProducer: false,
          isBuyer: true,
          city: 'Saint-Louis',
          region: 'Saint-Louis',
        },
      },
    },
    include: { profile: true },
  });

  const organisation = await prisma.organization.upsert({
    where: { slug: 'restaurant-ndar' },
    update: {},
    create: {
      ownerUserId: comptePro.id,
      name: 'Restaurant Ndar',
      slug: 'restaurant-ndar',
      sector: 'Restauration',
      country: 'SN',
      city: 'Saint-Louis',
      address: 'Hydrobase',
      phone: '+221770000000',
      planCode: 'pro-entreprise',
    },
  });

  await prisma.organizationMember.upsert({
    where: {
      organizationId_userId: {
        organizationId: organisation.id,
        userId: comptePro.id,
      },
    },
    update: { memberRole: 'OWNER', joinedAt: new Date() },
    create: {
      organizationId: organisation.id,
      userId: comptePro.id,
      memberRole: 'OWNER',
      joinedAt: new Date(),
      status: 'ACTIVE',
    },
  });

  const ferme = await prisma.farm.create({
    data: {
      ownerUserId: agriculteur.id,
      name: 'Ferme de Keur Matar',
      country: 'SN',
      region: 'Thiès',
      city: 'Pout',
      locationText: 'Pout, Thiès',
      notes: 'Exploitation maraîchère pilote',
    },
  }).catch(async () => prisma.farm.findFirstOrThrow({ where: { ownerUserId: agriculteur.id, name: 'Ferme de Keur Matar' } }));

  const parcelle = await prisma.plot.create({
    data: {
      farmId: ferme.id,
      name: 'Parcelle Tomate A',
      surfaceValue: 1.5,
      surfaceUnit: 'ha',
      soilNotes: 'Sol sableux avec bonne matière organique',
      irrigationType: 'goutte-a-goutte',
      locationText: 'Section Nord',
    },
  }).catch(async () => prisma.plot.findFirstOrThrow({ where: { farmId: ferme.id, name: 'Parcelle Tomate A' } }));

  const culture = await prisma.crop.create({
    data: {
      plotId: parcelle.id,
      cropName: 'Tomate',
      variety: 'Roma',
      seasonLabel: 'Saison sèche 2026',
      sowingDate: new Date('2026-01-15'),
      expectedHarvestDate: new Date('2026-04-25'),
      growthStage: 'Floraison',
      status: 'EN_COURS',
    },
  }).catch(async () => prisma.crop.findFirstOrThrow({ where: { plotId: parcelle.id, cropName: 'Tomate' } }));

  await prisma.product.createMany({
    data: [
      {
        sellerUserId: agriculteur.id,
        farmId: ferme.id,
        name: 'Tomate fraîche',
        category: 'Légume',
        description: 'Tomate fraîche cultivée à Pout',
        unit: 'kg',
        price: 650,
        quantityAvailable: 250,
        currency: 'XOF',
        country: 'SN',
        city: 'Thiès',
        status: StatutProduit.PUBLIE,
        publishedAt: new Date(),
      },
      {
        sellerUserId: agriculteur.id,
        farmId: ferme.id,
        name: 'Oignon jaune',
        category: 'Légume',
        description: 'Oignon de bonne conservation',
        unit: 'kg',
        price: 700,
        quantityAvailable: 140,
        currency: 'XOF',
        country: 'SN',
        city: 'Thiès',
        status: StatutProduit.PUBLIE,
        publishedAt: new Date(),
      },
    ],
    skipDuplicates: true,
  });

  const planPremium = await prisma.subscriptionPlan.findUniqueOrThrow({ where: { code: 'premium-agriculteur' } });
  const planPro = await prisma.subscriptionPlan.findUniqueOrThrow({ where: { code: 'pro-entreprise' } });

  await prisma.subscription.createMany({
    data: [
      {
        userId: agriculteur.id,
        planId: planPremium.id,
        status: 'ACTIVE',
        startedAt: new Date(),
        endsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
        autoRenew: true,
        quotaStateJson: { analysesMensuelles: 500, consommees: 3 },
      },
      {
        organizationId: organisation.id,
        planId: planPro.id,
        status: 'ACTIVE',
        startedAt: new Date(),
        endsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
        autoRenew: true,
        quotaStateJson: { analysesMensuelles: 1000, consommees: 8 },
      },
    ],
    skipDuplicates: true,
  });

  await prisma.task.createMany({
    data: [
      {
        userId: agriculteur.id,
        plotId: parcelle.id,
        cropId: culture.id,
        sourceType: 'IA',
        title: 'Vérifier l’humidité du sol',
        description: 'Faire un contrôle terrain avant 18h.',
        dueAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
        priority: 'HAUTE',
        status: StatutTache.A_FAIRE,
      },
      {
        userId: agriculteur.id,
        plotId: parcelle.id,
        cropId: culture.id,
        sourceType: 'CALENDRIER',
        title: 'Inspection feuilles du bas',
        description: 'Rechercher des taches ou signes de champignon.',
        dueAt: new Date(Date.now() + 1000 * 60 * 60 * 48),
        priority: 'MOYENNE',
        status: StatutTache.EN_COURS,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: agriculteur.id,
        type: 'ALERTE',
        title: 'Diagnostic conseillé',
        body: 'Envoie une photo nette de la feuille pour améliorer l’analyse.',
      },
      {
        userId: acheteur.id,
        type: 'INFO',
        title: 'Nouveaux produits disponibles',
        body: 'Tomate fraîche et oignon jaune sont disponibles à Thiès.',
      },
    ],
    skipDuplicates: true,
  });

  console.log({ admin: admin.email, agriculteur: agriculteur.email, acheteur: acheteur.email, comptePro: comptePro.email });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
