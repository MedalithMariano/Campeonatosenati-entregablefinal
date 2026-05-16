import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../users/enums/user-role.enum';
import { CreatePhaseDto } from './dto/create-phase.dto';
import { PhasesService } from './phases.service';

@Controller('tournaments/:tournamentId/phases')
export class PhasesController {
  constructor(private readonly phases: PhasesService) {}

  @Get()
  findAll(@Param('tournamentId', ParseUUIDPipe) tournamentId: string) {
    return this.phases.findByTournament(tournamentId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  create(
    @Param('tournamentId', ParseUUIDPipe) tournamentId: string,
    @Body() body: CreatePhaseDto,
  ) {
    return this.phases.create(tournamentId, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':phaseId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('tournamentId', ParseUUIDPipe) tournamentId: string,
    @Param('phaseId', ParseUUIDPipe) phaseId: string,
  ) {
    await this.phases.remove(tournamentId, phaseId);
  }
}
