import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CreerTacheDto {
  @ApiProperty() @IsString() titre: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() parcelleId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() cultureId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() sourceType?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() echeance?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() priorite?: string;
}
export class ModifierTacheDto extends CreerTacheDto {}

export class CreerRappelDto {
  @ApiProperty() @IsDateString() rappelAt: string;
  @ApiPropertyOptional() @IsOptional() @IsString() tacheId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() canal?: string;
}
