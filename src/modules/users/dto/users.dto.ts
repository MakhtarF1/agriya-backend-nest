import { ApiPropertyOptional } from '@nestjs/swagger';
import { RoleUtilisateur, StatutUtilisateur } from '@prisma/client';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';

export class MettreAJourUtilisateurDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nomComplet?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  telephone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ville?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  region?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isProducer?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isBuyer?: boolean;
}

export class ChangerLangueDto {
  @ApiPropertyOptional({ default: 'fr' })
  @IsString()
  langue: string;
}

export class ChangerPaysDto {
  @ApiPropertyOptional({ default: 'SN' })
  @IsString()
  pays: string;
}

export class ChangerStatutUtilisateurDto {
  @ApiPropertyOptional({ enum: StatutUtilisateur })
  @IsEnum(StatutUtilisateur)
  statut: StatutUtilisateur;

  @ApiPropertyOptional({ enum: RoleUtilisateur })
  @IsOptional()
  @IsEnum(RoleUtilisateur)
  role?: RoleUtilisateur;
}
