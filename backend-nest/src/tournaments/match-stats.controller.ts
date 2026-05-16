import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Put,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../users/enums/user-role.enum';
import { UpsertMatchStatsDto } from './dto/upsert-match-stats.dto';
import { MatchStatsService } from './match-stats.service';

@Controller('matches/:matchId/stats')
export class MatchStatsController {
  constructor(private readonly stats: MatchStatsService) {}

  @Get()
  findAll(@Param('matchId', ParseUUIDPipe) matchId: string) {
    return this.stats.findByMatch(matchId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Put(':teamId')
  upsert(
    @Param('matchId', ParseUUIDPipe) matchId: string,
    @Param('teamId', ParseUUIDPipe) teamId: string,
    @Body() body: UpsertMatchStatsDto,
  ) {
    return this.stats.upsert(matchId, teamId, body);
  }
}
