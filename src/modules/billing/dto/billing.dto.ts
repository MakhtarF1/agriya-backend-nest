import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreerAbonnementDto {
  @ApiProperty()
  @IsString()
  planId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  organisationId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  autoRenew?: boolean;
}

export class InitierPaiementDto {
  @ApiPropertyOptional() @IsOptional() @IsString() abonnementId?: string;
  @ApiProperty() @IsString() provider: string;
}

export class VerifierPaiementDto {
  @ApiProperty() @IsString() paiementId: string;
  @ApiPropertyOptional() @IsOptional() @IsString() statut?: string;
}
