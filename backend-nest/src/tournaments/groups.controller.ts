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
import { AssignGroupTeamDto } from './dto/assign-group-team.dto';
import { CreateGroupDto } from './dto/create-group.dto';
import { GroupsService } from './groups.service';

@Controller('phases/:phaseId/groups')
export class GroupsController {
  constructor(private readonly groups: GroupsService) {}

  @Get()
  findAll(@Param('phaseId', ParseUUIDPipe) phaseId: string) {
    return this.groups.findByPhase(phaseId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  create(
    @Param('phaseId', ParseUUIDPipe) phaseId: string,
    @Body() body: CreateGroupDto,
  ) {
    return this.groups.create(phaseId, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':groupId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('groupId', ParseUUIDPipe) groupId: string) {
    await this.groups.remove(groupId);
  }

  @Get(':groupId/teams')
  listTeams(@Param('groupId', ParseUUIDPipe) groupId: string) {
    return this.groups.listTeams(groupId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post(':groupId/teams')
  assignTeam(
    @Param('groupId', ParseUUIDPipe) groupId: string,
    @Body() body: AssignGroupTeamDto,
  ) {
    return this.groups.assignTeam(groupId, body.teamId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':groupId/teams/:teamId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async unassignTeam(
    @Param('groupId', ParseUUIDPipe) groupId: string,
    @Param('teamId', ParseUUIDPipe) teamId: string,
  ) {
    await this.groups.unassignTeam(groupId, teamId);
  }
}
