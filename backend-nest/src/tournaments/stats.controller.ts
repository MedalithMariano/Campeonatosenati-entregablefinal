import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { LeaderboardsService } from './leaderboards.service';
import { StandingsService } from './standings.service';

@Controller('tournaments/:tournamentId')
export class StatsController {
  constructor(
    private readonly standings: StandingsService,
    private readonly leaderboards: LeaderboardsService,
  ) {}

  @Get('standings')
  getStandings(@Param('tournamentId', ParseUUIDPipe) tournamentId: string) {
    return this.standings.forTournament(tournamentId);
  }

  @Get('top-scorers')
  getTopScorers(@Param('tournamentId', ParseUUIDPipe) tournamentId: string) {
    return this.leaderboards.topScorers(tournamentId);
  }

  @Get('top-assists')
  getTopAssists(@Param('tournamentId', ParseUUIDPipe) tournamentId: string) {
    return this.leaderboards.topAssists(tournamentId);
  }

  @Get('discipline')
  getDiscipline(@Param('tournamentId', ParseUUIDPipe) tournamentId: string) {
    return this.leaderboards.discipline(tournamentId);
  }
}
