import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreerExploitationDto {
  @ApiProperty() @IsString() nom: string;
  @ApiPropertyOptional() @IsOptional() @IsString() pays?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() region?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() ville?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() localisation?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}
export class ModifierExploitationDto extends CreerExploitationDto {}

export class CreerParcelleDto {
  @ApiProperty() @IsString() exploitationId: string;
  @ApiProperty() @IsString() nom: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() surfaceValeur?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() surfaceUnite?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notesSol?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() typeIrrigation?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() localisation?: string;
}
export class ModifierParcelleDto extends CreerParcelleDto {}

export class CreerCultureDto {
  @ApiProperty() @IsString() parcelleId: string;
  @ApiProperty() @IsString() nomCulture: string;
  @ApiPropertyOptional() @IsOptional() @IsString() variete?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() saison?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() dateSemis?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() dateRecoltePrevue?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() stadeCroissance?: string;
}
export class ModifierCultureDto extends CreerCultureDto {}

export class CreerDiagnosticDto {
  @ApiProperty() @IsString() typeDiagnostic: string;
  @ApiProperty() @IsString() resume: string;
  @ApiPropertyOptional() @IsOptional() @IsString() parcelleId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() cultureId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() conversationId?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() scoreConfiance?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() niveauUrgence?: string;
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() recommandations?: string[];
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() mediaIds?: string[];
}
export class ModifierDiagnosticDto extends CreerDiagnosticDto {}
