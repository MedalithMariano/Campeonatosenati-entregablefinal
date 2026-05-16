import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateGroupDto } from './dto/create-group.dto';
import { GroupTeam } from './entities/group-team.entity';
import { Group } from './entities/group.entity';
import { Phase } from './entities/phase.entity';
import { TournamentTeam } from './entities/tournament-team.entity';
import { PhaseType } from './enums/phase-type.enum';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Group)
    private readonly groups: Repository<Group>,
    @InjectRepository(GroupTeam)
    private readonly groupTeams: Repository<GroupTeam>,
    @InjectRepository(Phase)
    private readonly phases: Repository<Phase>,
    @InjectRepository(TournamentTeam)
    private readonly registrations: Repository<TournamentTeam>,
  ) {}

  findByPhase(phaseId: string): Promise<Group[]> {
    return this.groups.find({ where: { phaseId }, order: { name: 'ASC' } });
  }

  async create(phaseId: string, dto: CreateGroupDto): Promise<Group> {
    const phase = await this.phases.findOne({ where: { id: phaseId } });
    if (!phase) {
      throw new NotFoundException('Fase no encontrada');
    }
    if (phase.type !== PhaseType.GROUP_STAGE) {
      throw new BadRequestException(
        'Solo se pueden crear grupos en fases de tipo GROUP_STAGE',
      );
    }

    const conflict = await this.groups.findOne({
      where: { phaseId, name: dto.name },
    });
    if (conflict) {
      throw new ConflictException(
        `Ya existe un grupo "${dto.name}" en esta fase`,
      );
    }

    const group = this.groups.create({
      phaseId,
      name: dto.name,
      capacity: dto.capacity ?? 4,
    });
    return this.groups.save(group);
  }

  async remove(groupId: string): Promise<void> {
    const result = await this.groups.delete({ id: groupId });
    if (!result.affected) {
      throw new NotFoundException('Grupo no encontrado');
    }
  }

  listTeams(groupId: string): Promise<GroupTeam[]> {
    return this.groupTeams.find({
      where: { groupId },
      relations: { team: true },
      order: { createdAt: 'ASC' },
    });
  }

  async assignTeam(groupId: string, teamId: string): Promise<GroupTeam> {
    const group = await this.groups.findOne({ where: { id: groupId } });
    if (!group) {
      throw new NotFoundException('Grupo no encontrado');
    }

    const phase = await this.phases.findOne({ where: { id: group.phaseId } });
    if (!phase) {
      throw new NotFoundException('Fase no encontrada');
    }

    const registration = await this.registrations.findOne({
      where: { tournamentId: phase.tournamentId, teamId },
    });
    if (!registration) {
      throw new BadRequestException(
        'El equipo no está inscrito en el torneo',
      );
    }

    const phaseGroups = await this.groups.find({
      where: { phaseId: phase.id },
    });
    const phaseGroupIds = phaseGroups.map((g) => g.id);
    const alreadyInPhase = await this.groupTeams.findOne({
      where: { groupId: In(phaseGroupIds), teamId },
    });
    if (alreadyInPhase) {
      throw new ConflictException(
        'El equipo ya está asignado a un grupo de esta fase',
      );
    }

    const count = await this.groupTeams.count({ where: { groupId } });
    if (count >= group.capacity) {
      throw new ConflictException(
        `El grupo "${group.name}" ya tiene su capacidad completa (${group.capacity})`,
      );
    }

    const entry = this.groupTeams.create({ groupId, teamId });
    return this.groupTeams.save(entry);
  }

  async unassignTeam(groupId: string, teamId: string): Promise<void> {
    const result = await this.groupTeams.delete({ groupId, teamId });
    if (!result.affected) {
      throw new NotFoundException('Asignación no encontrada');
    }
  }
}
