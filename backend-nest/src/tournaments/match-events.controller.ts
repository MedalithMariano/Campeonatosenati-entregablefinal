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
import { CreateMatchEventDto } from './dto/create-match-event.dto';
import { MatchEventsService } from './match-events.service';

@Controller('matches/:matchId/events')
export class MatchEventsController {
  constructor(private readonly events: MatchEventsService) {}

  @Get()
  findAll(@Param('matchId', ParseUUIDPipe) matchId: string) {
    return this.events.findByMatch(matchId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  create(
    @Param('matchId', ParseUUIDPipe) matchId: string,
    @Body() body: CreateMatchEventDto,
  ) {
    return this.events.create(matchId, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':eventId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('matchId', ParseUUIDPipe) matchId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
  ) {
    await this.events.remove(matchId, eventId);
  }
}
