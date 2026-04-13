import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { AdminService } from './admin.service';

@ApiTags('Administration')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('tableau-de-bord')
  dashboard() { return this.adminService.dashboard(); }

  @Get('utilisateurs')
  users() { return this.adminService.users(); }

  @Get('produits')
  products() { return this.adminService.products(); }

  @Get('commandes')
  orders() { return this.adminService.orders(); }

  @Get('paiements')
  payments() { return this.adminService.payments(); }

  @Get('abonnements')
  subscriptions() { return this.adminService.subscriptions(); }

  @Patch('produits/:id/moderation')
  moderateProduct(@Param('id') id: string, @Body('statut') statut: string) {
    return this.adminService.moderateProduct(id, statut);
  }

  @Patch('utilisateurs/:id/suspendre')
  suspendUser(@Param('id') id: string) {
    return this.adminService.suspendUser(id);
  }

  @Get('statistiques')
  stats() { return this.adminService.stats(); }
}
