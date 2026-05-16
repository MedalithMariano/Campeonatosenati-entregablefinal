import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { PlayerPosition } from '../../players/enums/player-position.enum';

export class LineupEntryDto {
  @IsUUID('4')
  playerId!: string;

  @IsInt()
  @Min(1)
  @Max(99)
  shirtNumber!: number;

  @IsEnum(PlayerPosition)
  position!: PlayerPosition;

  @IsBoolean()
  isStarter!: boolean;
}

export class SetLineupDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => LineupEntryDto)
  entries!: LineupEntryDto[];
}
