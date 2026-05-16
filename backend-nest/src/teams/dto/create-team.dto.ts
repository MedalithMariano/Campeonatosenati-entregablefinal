import {
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

const HEX_COLOR = /^#([0-9A-Fa-f]{6})$/;

export class CreateTeamDto {
  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(80)
  name!: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(8)
  shortName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  city?: string;

  @IsOptional()
  @IsInt()
  @Min(1850, { message: 'El año de fundación parece muy antiguo' })
  @Max(new Date().getFullYear())
  foundedYear?: number;

  @IsOptional()
  @IsString()
  @Matches(HEX_COLOR, { message: 'El color debe ser hex (#RRGGBB)' })
  primaryColor?: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsString()
  logoPublicId?: string;
}
