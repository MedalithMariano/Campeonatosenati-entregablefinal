import { IsUUID } from 'class-validator';

export class AssignGroupTeamDto {
  @IsUUID('4', { message: 'teamId debe ser un UUID válido' })
  teamId!: string;
}
