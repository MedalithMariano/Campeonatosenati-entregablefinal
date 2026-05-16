import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class UpsertMatchStatsDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  possession?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  shots?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  shotsOnTarget?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  corners?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  fouls?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  offsides?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  saves?: number;
}
