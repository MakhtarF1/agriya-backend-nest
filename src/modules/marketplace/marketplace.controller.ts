import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { MarketplaceService } from './marketplace.service';
import { AjouterPanierDto, ChangerStatutCommandeDto, ChangerStatutProduitDto, CreerCommandeDto, CreerDemandeAchatDto, CreerProduitDto, ModifierDemandeAchatDto, ModifierPanierDto, ModifierProduitDto } from './dto/marketplace.dto';

@ApiTags('Marketplace')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class MarketplaceController {
  constructor(private readonly marketplaceService: MarketplaceService) {}

  @Post('produits')
  creerProduit(@CurrentUser('id') userId: string, @Body() dto: CreerProduitDto) {
    return this.marketplaceService.creerProduit(userId, dto);
  }

  @Get('produits')
  listerProduits(@Query() query: any) {
    return this.marketplaceService.listerProduits(query);
  }

  @Get('produits/:id')
  obtenirProduit(@Param('id') id: string) {
    return this.marketplaceService.obtenirProduit(id);
  }

  @Patch('produits/:id')
  modifierProduit(@Param('id') id: string, @CurrentUser('id') userId: string, @CurrentUser('role') role: string, @Body() dto: ModifierProduitDto) {
    return this.marketplaceService.modifierProduit(id, userId, role, dto);
  }

  @Delete('produits/:id')
  supprimerProduit(@Param('id') id: string, @CurrentUser('id') userId: string, @CurrentUser('role') role: string) {
    return this.marketplaceService.supprimerProduit(id, userId, role);
  }

  @Patch('produits/:id/statut')
  changerStatutProduit(@Param('id') id: string, @CurrentUser('id') userId: string, @CurrentUser('role') role: string, @Body() dto: ChangerStatutProduitDto) {
    return this.marketplaceService.changerStatutProduit(id, userId, role, dto);
  }

  @Get('mes/produits')
  mesProduits(@CurrentUser('id') userId: string) {
    return this.marketplaceService.mesProduits(userId);
  }

  @Post('produits/:id/favori')
  ajouterFavori(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.marketplaceService.ajouterFavori(userId, id);
  }

  @Delete('produits/:id/favori')
  retirerFavori(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.marketplaceService.retirerFavori(userId, id);
  }

  @Post('demandes-achat')
  creerDemandeAchat(@CurrentUser('id') userId: string, @Body() dto: CreerDemandeAchatDto) {
    return this.marketplaceService.creerDemandeAchat(userId, dto);
  }

  @Get('demandes-achat')
  listerDemandesAchat(@CurrentUser('id') userId: string) {
    return this.marketplaceService.listerDemandesAchat(userId);
  }

  @Get('demandes-achat/:id')
  obtenirDemandeAchat(@Param('id') id: string) {
    return this.marketplaceService.obtenirDemandeAchat(id);
  }

  @Patch('demandes-achat/:id')
  modifierDemandeAchat(@Param('id') id: string, @CurrentUser('id') userId: string, @CurrentUser('role') role: string, @Body() dto: ModifierDemandeAchatDto) {
    return this.marketplaceService.modifierDemandeAchat(id, userId, role, dto);
  }

  @Delete('demandes-achat/:id')
  supprimerDemandeAchat(@Param('id') id: string, @CurrentUser('id') userId: string, @CurrentUser('role') role: string) {
    return this.marketplaceService.supprimerDemandeAchat(id, userId, role);
  }

  @Post('panier/articles')
  ajouterPanier(@CurrentUser('id') userId: string, @Body() dto: AjouterPanierDto) {
    return this.marketplaceService.ajouterPanier(userId, dto);
  }

  @Get('panier')
  panier(@CurrentUser('id') userId: string) {
    return this.marketplaceService.panier(userId);
  }

  @Patch('panier/articles/:id')
  modifierPanier(@Param('id') id: string, @CurrentUser('id') userId: string, @Body() dto: ModifierPanierDto) {
    return this.marketplaceService.modifierPanier(id, userId, dto);
  }

  @Delete('panier/articles/:id')
  supprimerPanier(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.marketplaceService.supprimerPanier(id, userId);
  }

  @Post('commandes')
  creerCommande(@CurrentUser('id') userId: string, @Body() dto: CreerCommandeDto) {
    return this.marketplaceService.creerCommande(userId, dto);
  }

  @Get('commandes')
  commandes(@CurrentUser('id') userId: string, @CurrentUser('role') role: string) {
    return this.marketplaceService.commandes(userId, role);
  }

  @Get('commandes/:id')
  commande(@Param('id') id: string, @CurrentUser('id') userId: string, @CurrentUser('role') role: string) {
    return this.marketplaceService.commande(id, userId, role);
  }

  @Patch('commandes/:id/annuler')
  annulerCommande(@Param('id') id: string, @CurrentUser('id') userId: string, @CurrentUser('role') role: string) {
    return this.marketplaceService.annulerCommande(id, userId, role);
  }

  @Patch('commandes/:id/statut')
  changerStatutCommande(@Param('id') id: string, @CurrentUser('id') userId: string, @CurrentUser('role') role: string, @Body() dto: ChangerStatutCommandeDto) {
    return this.marketplaceService.changerStatutCommande(id, userId, role, dto);
  }

  @Get('ventes')
  ventes(@CurrentUser('id') userId: string) {
    return this.marketplaceService.ventes(userId);
  }
}
