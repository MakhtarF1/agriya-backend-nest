import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { OrganizationsService } from './organizations.service';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { AjouterMembreDto, ChangerRoleMembreDto, CreerOrganisationDto, MettreAJourOrganisationDto } from './dto/organizations.dto';

@ApiTags('Organisations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('organisations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  @Roles('COMPTE_PRO', 'ADMIN')
  creer(@CurrentUser('id') userId: string, @Body() dto: CreerOrganisationDto) {
    return this.organizationsService.creer(userId, dto);
  }

  @Get('moi')
  moi(@CurrentUser('id') userId: string) {
    return this.organizationsService.moi(userId);
  }

  @Patch(':id')
  @Roles('COMPTE_PRO', 'ADMIN')
  mettreAJour(@Param('id') id: string, @CurrentUser('id') userId: string, @Body() dto: MettreAJourOrganisationDto) {
    return this.organizationsService.mettreAJour(id, userId, dto);
  }

  @Post(':id/membres')
  @Roles('COMPTE_PRO', 'ADMIN')
  ajouterMembre(@Param('id') id: string, @CurrentUser('id') userId: string, @Body() dto: AjouterMembreDto) {
    return this.organizationsService.ajouterMembre(id, userId, dto);
  }

  @Get(':id/membres')
  listerMembres(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.organizationsService.listerMembres(id, userId);
  }

  @Delete(':id/membres/:memberId')
  @Roles('COMPTE_PRO', 'ADMIN')
  retirerMembre(@Param('id') id: string, @Param('memberId') memberId: string, @CurrentUser('id') userId: string) {
    return this.organizationsService.retirerMembre(id, memberId, userId);
  }

  @Patch(':id/membres/:memberId/role')
  @Roles('COMPTE_PRO', 'ADMIN')
  changerRole(@Param('id') id: string, @Param('memberId') memberId: string, @CurrentUser('id') userId: string, @Body() dto: ChangerRoleMembreDto) {
    return this.organizationsService.changerRole(id, memberId, userId, dto);
  }
}
