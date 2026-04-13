import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class CreerOrganisationDto {
  @ApiProperty()
  @IsString()
  nom: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  secteur?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pays?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ville?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  adresse?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  telephone?: string;
}

export class MettreAJourOrganisationDto extends CreerOrganisationDto {}

export class AjouterMembreDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ default: 'MEMBRE' })
  @IsOptional()
  @IsString()
  role?: string;
}

export class ChangerRoleMembreDto {
  @ApiProperty()
  @IsString()
  role: string;
}
