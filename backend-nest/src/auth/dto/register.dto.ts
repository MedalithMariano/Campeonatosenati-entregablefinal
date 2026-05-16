import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { DocumentType } from '../../profiles/enums/document-type.enum';

export class RegisterDto {
  @IsEmail({}, { message: 'El email no es válido' })
  email!: string;

  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  @MaxLength(72, { message: 'La contraseña no puede exceder 72 caracteres' })
  password!: string;

  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(60)
  firstName!: string;

  @IsString()
  @MinLength(2, { message: 'El apellido debe tener al menos 2 caracteres' })
  @MaxLength(60)
  lastName!: string;

  @IsEnum(DocumentType, {
    message: 'El tipo de documento debe ser DNI, CE, PASAPORTE o RUC',
  })
  documentType!: DocumentType;

  @IsString()
  @Matches(/^[A-Za-z0-9]{6,20}$/, {
    message: 'El número de documento debe ser alfanumérico (6-20 caracteres)',
  })
  documentNumber!: string;

  @IsOptional()
  @IsString()
  @Matches(/^\+?[0-9]{7,15}$/, { message: 'El teléfono no es válido' })
  phone?: string;

  @IsOptional()
  @IsDateString({}, { message: 'La fecha de nacimiento debe ser YYYY-MM-DD' })
  birthDate?: string;
}
