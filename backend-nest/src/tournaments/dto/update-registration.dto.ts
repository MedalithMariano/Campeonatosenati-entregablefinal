import { IsEnum, IsOptional } from 'class-validator';
import { RegistrationStatus } from '../enums/registration-status.enum';

export class UpdateRegistrationDto {
  @IsOptional()
  @IsEnum(RegistrationStatus, {
    message:
      'status debe ser PENDING, APPROVED, REJECTED o WITHDRAWN',
  })
  status?: RegistrationStatus;
}
