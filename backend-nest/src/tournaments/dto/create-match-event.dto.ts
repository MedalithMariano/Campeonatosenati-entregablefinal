import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { MatchEventType } from '../enums/match-event-type.enum';

export class CreateMatchEventDto {
  @IsEnum(MatchEventType)
  type!: MatchEventType;

  @IsInt()
  @Min(0)
  @Max(150)
  minute!: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(30)
  addedMinute?: number;

  @IsUUID('4')
  teamId!: string;

  @IsUUID('4')
  playerId!: string;

  @IsOptional()
  @IsUUID('4')
  relatedPlayerId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  notes?: string;
}
