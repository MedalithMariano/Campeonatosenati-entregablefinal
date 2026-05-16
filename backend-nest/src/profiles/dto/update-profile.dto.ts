import {
  IsDateString,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(60)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'El apellido debe tener al menos 2 caracteres' })
  @MaxLength(60)
  lastName?: string;

  // Permite null para limpiar el campo, o string con formato válido.
  @ValidateIf((_, value) => value !== null)
  @IsOptional()
  @IsString()
  @Matches(/^\+?[0-9]{7,15}$/, { message: 'El teléfono no es válido' })
  phone?: string | null;

  @ValidateIf((_, value) => value !== null)
  @IsOptional()
  @IsDateString({}, { message: 'La fecha de nacimiento debe ser YYYY-MM-DD' })
  birthDate?: string | null;
}