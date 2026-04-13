import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { OperationsService } from './operations.service';
import { CreerRappelDto, CreerTacheDto, ModifierTacheDto } from './dto/operations.dto';

@ApiTags('Opérations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class OperationsController {
  constructor(private readonly operationsService: OperationsService) {}

  @Post('taches')
  creerTache(@CurrentUser('id') userId: string, @Body() dto: CreerTacheDto) {
    return this.operationsService.creerTache(userId, dto);
  }

  @Get('taches')
  listerTaches(@CurrentUser('id') userId: string) {
    return this.operationsService.listerTaches(userId);
  }

  @Get('taches/:id')
  tache(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.operationsService.tache(id, userId);
  }

  @Patch('taches/:id')
  modifierTache(@Param('id') id: string, @CurrentUser('id') userId: string, @Body() dto: ModifierTacheDto) {
    return this.operationsService.modifierTache(id, userId, dto);
  }

  @Patch('taches/:id/terminer')
  terminerTache(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.operationsService.terminerTache(id, userId);
  }

  @Delete('taches/:id')
  supprimerTache(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.operationsService.supprimerTache(id, userId);
  }

  @Get('calendrier')
  calendrier(@CurrentUser('id') userId: string) {
    return this.operationsService.calendrier(userId);
  }

  @Post('rappels')
  creerRappel(@CurrentUser('id') userId: string, @Body() dto: CreerRappelDto) {
    return this.operationsService.creerRappel(userId, dto);
  }

  @Get('rappels')
  rappels(@CurrentUser('id') userId: string) {
    return this.operationsService.rappels(userId);
  }

  @Get('notifications')
  notifications(@CurrentUser('id') userId: string) {
    return this.operationsService.notifications(userId);
  }

  @Patch('notifications/:id/lire')
  lire(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.operationsService.lireNotification(userId, id);
  }

  @Patch('notifications/tout-lire')
  toutLire(@CurrentUser('id') userId: string) {
    return this.operationsService.toutLire(userId);
  }

  @Delete('notifications/:id')
  supprimerNotification(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.operationsService.supprimerNotification(userId, id);
  }
}
