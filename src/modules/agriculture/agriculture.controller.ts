import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AgricultureService } from './agriculture.service';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { CreerCultureDto, CreerDiagnosticDto, CreerExploitationDto, CreerParcelleDto, ModifierCultureDto, ModifierDiagnosticDto, ModifierExploitationDto, ModifierParcelleDto } from './dto/agriculture.dto';

@ApiTags('Agriculture')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('AGRICULTEUR', 'ADMIN')
@Controller()
export class AgricultureController {
  constructor(private readonly agricultureService: AgricultureService) {}

  @Post('exploitations')
  creerExploitation(@CurrentUser('id') userId: string, @Body() dto: CreerExploitationDto) {
    return this.agricultureService.creerExploitation(userId, dto);
  }

  @Get('exploitations')
  listerExploitations(@CurrentUser('id') userId: string) {
    return this.agricultureService.listerExploitations(userId);
  }

  @Get('exploitations/:id')
  obtenirExploitation(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.agricultureService.obtenirExploitation(id, userId);
  }

  @Patch('exploitations/:id')
  modifierExploitation(@Param('id') id: string, @CurrentUser('id') userId: string, @Body() dto: ModifierExploitationDto) {
    return this.agricultureService.modifierExploitation(id, userId, dto);
  }

  @Delete('exploitations/:id')
  supprimerExploitation(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.agricultureService.supprimerExploitation(id, userId);
  }

  @Post('parcelles')
  creerParcelle(@CurrentUser('id') userId: string, @Body() dto: CreerParcelleDto) {
    return this.agricultureService.creerParcelle(userId, dto);
  }

  @Get('parcelles')
  listerParcelles(@CurrentUser('id') userId: string) {
    return this.agricultureService.listerParcelles(userId);
  }

  @Get('parcelles/:id')
  obtenirParcelle(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.agricultureService.obtenirParcelle(id, userId);
  }

  @Patch('parcelles/:id')
  modifierParcelle(@Param('id') id: string, @CurrentUser('id') userId: string, @Body() dto: ModifierParcelleDto) {
    return this.agricultureService.modifierParcelle(id, userId, dto);
  }

  @Delete('parcelles/:id')
  supprimerParcelle(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.agricultureService.supprimerParcelle(id, userId);
  }

  @Post('cultures')
  creerCulture(@CurrentUser('id') userId: string, @Body() dto: CreerCultureDto) {
    return this.agricultureService.creerCulture(userId, dto);
  }

  @Get('cultures')
  listerCultures(@CurrentUser('id') userId: string) {
    return this.agricultureService.listerCultures(userId);
  }

  @Get('cultures/:id')
  obtenirCulture(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.agricultureService.obtenirCulture(id, userId);
  }

  @Patch('cultures/:id')
  modifierCulture(@Param('id') id: string, @CurrentUser('id') userId: string, @Body() dto: ModifierCultureDto) {
    return this.agricultureService.modifierCulture(id, userId, dto);
  }

  @Delete('cultures/:id')
  supprimerCulture(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.agricultureService.supprimerCulture(id, userId);
  }

  @Post('diagnostics')
  creerDiagnostic(@CurrentUser('id') userId: string, @Body() dto: CreerDiagnosticDto) {
    return this.agricultureService.creerDiagnostic(userId, dto);
  }

  @Get('diagnostics')
  listerDiagnostics(@CurrentUser('id') userId: string) {
    return this.agricultureService.listerDiagnostics(userId);
  }

  @Get('diagnostics/statistiques/moi')
  statistiques(@CurrentUser('id') userId: string) {
    return this.agricultureService.statistiques(userId);
  }

  @Get('diagnostics/:id')
  obtenirDiagnostic(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.agricultureService.obtenirDiagnostic(id, userId);
  }

  @Get('diagnostics/:id/medias')
  obtenirMedias(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.agricultureService.obtenirMediasDiagnostic(id, userId);
  }

  @Patch('diagnostics/:id')
  modifierDiagnostic(@Param('id') id: string, @CurrentUser('id') userId: string, @CurrentUser('role') role: string, @Body() dto: ModifierDiagnosticDto) {
    return this.agricultureService.modifierDiagnostic(id, userId, dto);
  }

  @Delete('diagnostics/:id')
  supprimerDiagnostic(@Param('id') id: string, @CurrentUser('id') userId: string, @CurrentUser('role') role: string) {
    return this.agricultureService.supprimerDiagnostic(id, userId, role === 'ADMIN');
  }
}
