# AGRIYA Backend NestJS

Backend NestJS professionnel pour AGRIYA.

## Points clés
- Endpoints en français
- Swagger sur `/docs`
- JWT + rôles + CORS
- PostgreSQL via Prisma
- Seed métier prêt
- Upload média local
- Modules : auth, utilisateurs, organisations, agriculture, médias, IA, marketplace, abonnements/paiements, opérations, admin

## Démarrage

```bash
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
npm run start:dev
```

## Endpoint santé

```text
GET /api/v1/sante
```
