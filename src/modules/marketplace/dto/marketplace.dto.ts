import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreerProduitDto {
  @ApiProperty() @IsString() nom: string;
  @ApiPropertyOptional() @IsOptional() @IsString() categorie?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() unite?: string;
  @ApiProperty() @IsNumber() prix: number;
  @ApiProperty() @IsNumber() quantiteDisponible: number;
  @ApiPropertyOptional() @IsOptional() @IsString() devise?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() pays?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() ville?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() exploitationId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() statut?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() mediaIdPrincipal?: string;
}
export class ModifierProduitDto extends CreerProduitDto {}
export class ChangerStatutProduitDto { @ApiProperty() @IsString() statut: string; }

export class CreerDemandeAchatDto {
  @ApiProperty() @IsString() titre: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() categorie?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() quantiteDemandee?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() unite?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() prixCible?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() ville?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() besoinAvant?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() organisationId?: string;
}
export class ModifierDemandeAchatDto extends CreerDemandeAchatDto {}

export class AjouterPanierDto {
  @ApiProperty() @IsString() produitId: string;
  @ApiProperty() @IsNumber() quantite: number;
  @ApiPropertyOptional() @IsOptional() @IsString() unite?: string;
}
export class ModifierPanierDto extends AjouterPanierDto {}

export class CreerCommandeDto {
  @ApiPropertyOptional() @IsOptional() @IsString() organisationId?: string;
}

export class ChangerStatutCommandeDto { @ApiProperty() @IsString() statut: string; }
