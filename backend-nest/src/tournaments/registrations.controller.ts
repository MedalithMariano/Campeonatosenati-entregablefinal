import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../users/enums/user-role.enum';
import { RegisterTeamDto } from './dto/register-team.dto';
import { UpdateRegistrationDto } from './dto/update-registration.dto';
import { RegistrationsService } from './registrations.service';

@Controller('tournaments/:tournamentId/teams')
export class RegistrationsController {
  constructor(private readonly registrations: RegistrationsService) {}

  @Get()
  findAll(@Param('tournamentId', ParseUUIDPipe) tournamentId: string) {
    return this.registrations.findByTournament(tournamentId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  register(
    @Param('tournamentId', ParseUUIDPipe) tournamentId: string,
    @Body() body: RegisterTeamDto,
  ) {
    return this.registrations.register(tournamentId, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':teamId')
  updateStatus(
    @Param('tournamentId', ParseUUIDPipe) tournamentId: string,
    @Param('teamId', ParseUUIDPipe) teamId: string,
    @Body() body: UpdateRegistrationDto,
  ) {
    return this.registrations.updateStatus(tournamentId, teamId, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':teamId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('tournamentId', ParseUUIDPipe) tournamentId: string,
    @Param('teamId', ParseUUIDPipe) teamId: string,
  ) {
    await this.registrations.remove(tournamentId, teamId);
  }
}
