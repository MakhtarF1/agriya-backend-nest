import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RoleUtilisateur } from '@prisma/client';
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export class InscriptionDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  motDePasse: string;

  @ApiProperty()
  @IsString()
  nomComplet: string;

  @ApiPropertyOptional({ enum: RoleUtilisateur })
  @IsOptional()
  @IsEnum(RoleUtilisateur)
  role?: RoleUtilisateur;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  telephone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pays?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  langue?: string;
}

export class ConnexionDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  motDePasse: string;
}

export class RafraichirDto {
  @ApiProperty()
  @IsString()
  refreshToken: string;
}

export class MotDePasseOublieDto {
  @ApiProperty()
  @IsEmail()
  email: string;
}

export class ReinitialiserMotDePasseDto {
  @ApiProperty()
  @IsString()
  token: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  nouveauMotDePasse: string;
}

export class VerifierOtpDto {
  @ApiProperty()
  @IsString()
  code: string;
}
