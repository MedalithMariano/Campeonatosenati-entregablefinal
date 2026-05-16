import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { DocumentType } from '../../profiles/enums/document-type.enum';
import { PlayerPosition } from '../enums/player-position.enum';
import { PreferredFoot } from '../enums/preferred-foot.enum';

export class CreatePlayerDto {
  @IsString()
  @MinLength(2)
  @MaxLength(60)
  firstName!: string;

  @IsString()
  @MinLength(2)
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

  @IsDateString({}, { message: 'La fecha de nacimiento debe ser YYYY-MM-DD' })
  birthDate!: string;

  @IsEnum(PlayerPosition, {
    message: 'La posición debe ser GK, DEF, MID o FWD',
  })
  position!: PlayerPosition;

  @IsOptional()
  @IsEnum(PreferredFoot, {
    message: 'El pie hábil debe ser LEFT, RIGHT o BOTH',
  })
  preferredFoot?: PreferredFoot;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  nationality?: string;

  @IsOptional()
  @IsString()
  photoUrl?: string;

  @IsOptional()
  @IsString()
  photoPublicId?: string;
}
