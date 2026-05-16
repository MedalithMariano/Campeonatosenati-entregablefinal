import {
  Controller,
  Delete,
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
import { FixtureService } from './fixture.service';

@Controller('tournaments/:tournamentId/fixture')
export class FixtureController {
  constructor(private readonly fixture: FixtureService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('generate')
  generate(@Param('tournamentId', ParseUUIDPipe) tournamentId: string) {
    return this.fixture.generate(tournamentId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async drop(@Param('tournamentId', ParseUUIDPipe) tournamentId: string) {
    await this.fixture.drop(tournamentId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('seed-knockout')
  seedKnockout(@Param('tournamentId', ParseUUIDPipe) tournamentId: string) {
    return this.fixture.seedKnockoutFromGroups(tournamentId);
  }
}
