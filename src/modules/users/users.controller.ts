import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { ChangerLangueDto, ChangerPaysDto, ChangerStatutUtilisateurDto, MettreAJourUtilisateurDto } from './dto/users.dto';

@ApiTags('Utilisateurs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('utilisateurs')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('moi')
  moi(@CurrentUser('id') userId: string) {
    return this.usersService.moi(userId);
  }

  @Patch('moi')
  mettreAJourMoi(@CurrentUser('id') userId: string, @Body() dto: MettreAJourUtilisateurDto) {
    return this.usersService.mettreAJourMoi(userId, dto);
  }

  @Patch('moi/langue')
  changerLangue(@CurrentUser('id') userId: string, @Body() dto: ChangerLangueDto) {
    return this.usersService.changerLangue(userId, dto);
  }

  @Patch('moi/pays')
  changerPays(@CurrentUser('id') userId: string, @Body() dto: ChangerPaysDto) {
    return this.usersService.changerPays(userId, dto);
  }

  @Get()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Lister les utilisateurs' })
  lister(@Query('role') role?: string, @Query('statut') statut?: string) {
    return this.usersService.lister(role, statut);
  }

  @Get(':id')
  @Roles('ADMIN')
  obtenir(@Param('id') id: string) {
    return this.usersService.obtenir(id);
  }

  @Patch(':id/statut')
  @Roles('ADMIN')
  changerStatut(@Param('id') id: string, @Body() dto: ChangerStatutUtilisateurDto) {
    return this.usersService.changerStatut(id, dto);
  }
}
