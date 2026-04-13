import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { Roles } from '../../shared/decorators/roles.decorator';
import { BillingService } from './billing.service';
import { CreerAbonnementDto, InitierPaiementDto, VerifierPaiementDto } from './dto/billing.dto';

@ApiTags('Abonnements & paiements')
@Controller()
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Get('plans-abonnement')
  plans() {
    return this.billingService.plans();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Post('abonnements')
  creerAbonnement(@CurrentUser('id') userId: string, @Body() dto: CreerAbonnementDto) {
    return this.billingService.creerAbonnement(userId, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Get('abonnements/moi')
  abonnementActif(@CurrentUser('id') userId: string) {
    return this.billingService.abonnementActif(userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Patch('abonnements/moi/annuler')
  annuler(@CurrentUser('id') userId: string) {
    return this.billingService.annuler(userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Post('abonnements/moi/renouveler')
  renouveler(@CurrentUser('id') userId: string) {
    return this.billingService.renouveler(userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Get('abonnements/historique')
  historique(@CurrentUser('id') userId: string) {
    return this.billingService.historique(userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Post('paiements/initier')
  initier(@CurrentUser('id') userId: string, @Body() dto: InitierPaiementDto) {
    return this.billingService.initierPaiement(userId, dto);
  }

  @Post('paiements/webhook')
  webhook(@Body() payload: any) {
    return this.billingService.webhook(payload);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Get('paiements/moi')
  paiements(@CurrentUser('id') userId: string) {
    return this.billingService.paiements(userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Get('paiements/:id')
  paiement(@Param('id') id: string, @CurrentUser('id') userId: string, @CurrentUser('role') role: string) {
    return this.billingService.paiement(id, userId, role);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Post('paiements/verifier')
  verifier(@CurrentUser('id') userId: string, @CurrentUser('role') role: string, @Body() dto: VerifierPaiementDto) {
    return this.billingService.verifier(userId, role, dto);
  }
}
