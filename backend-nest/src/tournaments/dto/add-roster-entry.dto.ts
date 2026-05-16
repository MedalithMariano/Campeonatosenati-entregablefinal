import { IsInt, IsUUID, Max, Min } from 'class-validator';

export class AddRosterEntryDto {
  @IsUUID('4', { message: 'playerId debe ser un UUID válido' })
  playerId!: string;

  @IsInt()
  @Min(1, { message: 'El dorsal mínimo es 1' })
  @Max(99, { message: 'El dorsal máximo es 99' })
  shirtNumber!: number;
}
