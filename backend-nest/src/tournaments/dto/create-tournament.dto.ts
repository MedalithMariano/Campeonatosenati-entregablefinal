import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { TournamentFormat } from '../enums/tournament-format.enum';
import { TournamentStatus } from '../enums/tournament-status.enum';

export class CreateTournamentDto {
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  name!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(20)
  season!: string;

  @IsEnum(TournamentFormat, {
    message: 'El formato debe ser LEAGUE, KNOCKOUT o GROUPS_KNOCKOUT',
  })
  format!: TournamentFormat;

  @IsOptional()
  @IsEnum(TournamentStatus)
  status?: TournamentStatus;

  @IsOptional()
  @IsInt()
  @Min(0)
  pointsWin?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  pointsDraw?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  pointsLoss?: number;

  @IsOptional()
  @IsInt()
  @Min(1, { message: 'El mínimo de jugadores debe ser al menos 1' })
  minPlayersPerRoster?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxPlayersPerRoster?: number;

  @IsOptional()
  @IsDateString({}, { message: 'startDate debe ser YYYY-MM-DD' })
  startDate?: string;

  @IsOptional()
  @IsDateString({}, { message: 'endDate debe ser YYYY-MM-DD' })
  endDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsString()
  bannerUrl?: string;

  @IsOptional()
  @IsString()
  bannerPublicId?: string;
}
