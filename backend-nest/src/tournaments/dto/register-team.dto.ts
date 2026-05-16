import { IsUUID } from 'class-validator';

export class RegisterTeamDto {
  @IsUUID('4', { message: 'teamId debe ser un UUID válido' })
  teamId!: string;
}
