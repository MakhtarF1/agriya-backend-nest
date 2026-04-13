import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { ConnexionDto, InscriptionDto, MotDePasseOublieDto, RafraichirDto, ReinitialiserMotDePasseDto, VerifierOtpDto } from './dto/auth.dto';
import * as bcrypt from 'bcryptjs';
import { userInclude } from '../../shared/constants/includes';
import { RoleUtilisateur, StatutUtilisateur } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService, private readonly jwtService: JwtService) {}

  async inscription(dto: InscriptionDto) {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (exists) throw new BadRequestException('Un compte existe déjà avec cet email.');

    const passwordHash = await bcrypt.hash(dto.motDePasse, 12);
    const role = dto.role || RoleUtilisateur.AGRICULTEUR;
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        phone: dto.telephone,
        passwordHash,
        role,
        status: StatutUtilisateur.ACTIF,
        country: dto.pays || 'SN',
        language: dto.langue || 'fr',
        profile: {
          create: {
            fullName: dto.nomComplet,
            preferredLanguage: dto.langue || 'fr',
            isProducer: role === RoleUtilisateur.AGRICULTEUR,
            isBuyer: role === RoleUtilisateur.ACHETEUR || role === RoleUtilisateur.COMPTE_PRO,
          },
        },
      },
      include: userInclude,
    });

    return this.buildAuthResponse(user);
  }

  async connexion(dto: ConnexionDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email }, include: userInclude });
    if (!user) throw new UnauthorizedException('Identifiants invalides.');
    const valid = await bcrypt.compare(dto.motDePasse, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Identifiants invalides.');
    await this.prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    return this.buildAuthResponse(user);
  }

  async rafraichir(dto: RafraichirDto) {
    try {
      const payload = await this.jwtService.verifyAsync(dto.refreshToken);
      const user = await this.prisma.user.findUnique({ where: { id: payload.sub }, include: userInclude });
      if (!user) throw new UnauthorizedException('Session invalide.');
      return this.buildAuthResponse(user);
    } catch {
      throw new UnauthorizedException('Refresh token invalide.');
    }
  }

  async deconnexion() {
    return { message: 'Déconnexion effectuée.' };
  }

  async motDePasseOublie(dto: MotDePasseOublieDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    return {
      message: user
        ? 'Un lien de réinitialisation simulé a été généré.'
        : 'Si ce compte existe, une procédure de réinitialisation a été lancée.',
      token: user ? await this.jwtService.signAsync({ sub: user.id, type: 'reset' }, { expiresIn: '30m' }) : null,
    };
  }

  async reinitialiserMotDePasse(dto: ReinitialiserMotDePasseDto) {
    const payload = await this.jwtService.verifyAsync(dto.token).catch(() => {
      throw new UnauthorizedException('Jeton de réinitialisation invalide.');
    });
    if (payload.type !== 'reset') throw new UnauthorizedException('Jeton de réinitialisation invalide.');
    const passwordHash = await bcrypt.hash(dto.nouveauMotDePasse, 12);
    const user = await this.prisma.user.update({
      where: { id: payload.sub },
      data: { passwordHash },
      include: userInclude,
    });
    return this.buildAuthResponse(user);
  }

  async verifierOtp(dto: VerifierOtpDto) {
    return { valide: dto.code === '123456', message: dto.code === '123456' ? 'Code OTP valide.' : 'Code OTP invalide.' };
  }

  async moi(userId: string) {
    return this.prisma.user.findUniqueOrThrow({ where: { id: userId }, include: userInclude });
  }

  private async buildAuthResponse(user: any) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const { passwordHash, ...safeUser } = user;
    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = await this.jwtService.signAsync({ ...payload, type: 'refresh' }, { expiresIn: '30d' });
    return {
      utilisateur: safeUser,
      jetons: {
        accessToken,
        refreshToken,
        tokenType: 'Bearer',
      },
    };
  }
}
