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
import { AddRosterEntryDto } from './dto/add-roster-entry.dto';
import { UpdateRosterEntryDto } from './dto/update-roster-entry.dto';
import { RostersService } from './rosters.service';

@Controller('tournaments/:tournamentId/teams/:teamId/roster')
export class RostersController {
  constructor(private readonly rosters: RostersService) {}

  @Get()
  findAll(
    @Param('tournamentId', ParseUUIDPipe) tournamentId: string,
    @Param('teamId', ParseUUIDPipe) teamId: string,
  ) {
    return this.rosters.findByTeam(tournamentId, teamId);
  }

  @Get('validate')
  validate(
    @Param('tournamentId', ParseUUIDPipe) tournamentId: string,
    @Param('teamId', ParseUUIDPipe) teamId: string,
  ) {
    return this.rosters.validate(tournamentId, teamId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  add(
    @Param('tournamentId', ParseUUIDPipe) tournamentId: string,
    @Param('teamId', ParseUUIDPipe) teamId: string,
    @Body() body: AddRosterEntryDto,
  ) {
    return this.rosters.addEntry(tournamentId, teamId, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':playerId')
  update(
    @Param('tournamentId', ParseUUIDPipe) tournamentId: string,
    @Param('teamId', ParseUUIDPipe) teamId: string,
    @Param('playerId', ParseUUIDPipe) playerId: string,
    @Body() body: UpdateRosterEntryDto,
  ) {
    return this.rosters.updateEntry(tournamentId, teamId, playerId, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':playerId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('tournamentId', ParseUUIDPipe) tournamentId: string,
    @Param('teamId', ParseUUIDPipe) teamId: string,
    @Param('playerId', ParseUUIDPipe) playerId: string,
  ) {
    await this.rosters.removeEntry(tournamentId, teamId, playerId);
  }
}
