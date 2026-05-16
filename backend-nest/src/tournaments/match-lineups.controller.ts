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
import { SetLineupDto } from './dto/set-lineup.dto';
import { MatchLineupsService } from './match-lineups.service';

@Controller('matches/:matchId/lineup')
export class MatchLineupsController {
  constructor(private readonly lineups: MatchLineupsService) {}

  @Get()
  findAll(@Param('matchId', ParseUUIDPipe) matchId: string) {
    return this.lineups.findByMatch(matchId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Put(':teamId')
  setLineup(
    @Param('matchId', ParseUUIDPipe) matchId: string,
    @Param('teamId', ParseUUIDPipe) teamId: string,
    @Body() body: SetLineupDto,
  ) {
    return this.lineups.setLineup(matchId, teamId, body);
  }
}
