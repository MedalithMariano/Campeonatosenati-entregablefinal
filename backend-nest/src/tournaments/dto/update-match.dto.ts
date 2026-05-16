import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { MatchStatus } from '../enums/match-status.enum';

export class UpdateMatchDto {
  @IsOptional()
  @IsDateString()
  kickoff?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  venue?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  homeFormation?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  awayFormation?: string | null;

  @IsOptional()
  @IsEnum(MatchStatus)
  status?: MatchStatus;

  @IsOptional()
  @IsInt()
  @Min(0)
  homeScore?: number | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  awayScore?: number | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  homePenalties?: number | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  awayPenalties?: number | null;
}
