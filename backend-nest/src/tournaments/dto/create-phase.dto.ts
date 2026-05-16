import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { PhaseType } from '../enums/phase-type.enum';

export class CreatePhaseDto {
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name!: string;

  @IsEnum(PhaseType, {
    message:
      'type debe ser LEAGUE, GROUP_STAGE, ROUND_OF_16, QUARTERFINAL, SEMIFINAL, FINAL o THIRD_PLACE',
  })
  type!: PhaseType;

  @IsInt()
  @Min(1)
  order!: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(2)
  legs?: number;
}
