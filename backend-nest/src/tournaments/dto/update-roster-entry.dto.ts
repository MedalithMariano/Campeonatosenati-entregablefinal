import { IsInt, Max, Min } from 'class-validator';

export class UpdateRosterEntryDto {
  @IsInt()
  @Min(1, { message: 'El dorsal mínimo es 1' })
  @Max(99, { message: 'El dorsal máximo es 99' })
  shirtNumber!: number;
}
