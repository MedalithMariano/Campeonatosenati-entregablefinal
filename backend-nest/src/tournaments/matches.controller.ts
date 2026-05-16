import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../users/enums/user-role.enum';
import { UpdateMatchDto } from './dto/update-match.dto';
import { MatchesService } from './matches.service';

@Controller()
export class MatchesController {
  constructor(private readonly matches: MatchesService) {}

  @Get('tournaments/:tournamentId/matches')
  findByTournament(
    @Param('tournamentId', ParseUUIDPipe) tournamentId: string,
  ) {
    return this.matches.findByTournament(tournamentId);
  }

  @Get('matches/:id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.matches.findById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch('matches/:id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateMatchDto,
  ) {
    return this.matches.update(id, body);
  }
}
