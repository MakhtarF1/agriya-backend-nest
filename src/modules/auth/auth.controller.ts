import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { ConnexionDto, InscriptionDto, MotDePasseOublieDto, RafraichirDto, ReinitialiserMotDePasseDto, VerifierOtpDto } from './dto/auth.dto';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';

@ApiTags('Authentification')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('inscription')
  @ApiOperation({ summary: 'Créer un compte utilisateur' })
  inscription(@Body() dto: InscriptionDto) {
    return this.authService.inscription(dto);
  }

  @Post('connexion')
  @ApiOperation({ summary: 'Connecter un utilisateur et renvoyer les jetons.' })
  connexion(@Body() dto: ConnexionDto) {
    return this.authService.connexion(dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('deconnexion')
  @ApiOperation({ summary: 'Fermer la session utilisateur.' })
  deconnexion() {
    return this.authService.deconnexion();
  }

  @Post('rafraichir')
  @ApiOperation({ summary: 'Renouveler le jeton d’accès' })
  rafraichir(@Body() dto: RafraichirDto) {
    return this.authService.rafraichir(dto);
  }

  @Post('mot-de-passe/oublie')
  motDePasseOublie(@Body() dto: MotDePasseOublieDto) {
    return this.authService.motDePasseOublie(dto);
  }

  @Post('mot-de-passe/reinitialiser')
  reinitialiser(@Body() dto: ReinitialiserMotDePasseDto) {
    return this.authService.reinitialiserMotDePasse(dto);
  }

  @Post('verifier-otp')
  verifierOtp(@Body() dto: VerifierOtpDto) {
    return this.authService.verifierOtp(dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('moi')
  moi(@CurrentUser('id') userId: string) {
    return this.authService.moi(userId);
  }
}
