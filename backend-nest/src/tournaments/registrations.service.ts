import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from '../teams/entities/team.entity';
import { RegisterTeamDto } from './dto/register-team.dto';
import { UpdateRegistrationDto } from './dto/update-registration.dto';
import { TournamentTeam } from './entities/tournament-team.entity';
import { Tournament } from './entities/tournament.entity';

@Injectable()
export class RegistrationsService {
  constructor(
    @InjectRepository(TournamentTeam)
    private readonly registrations: Repository<TournamentTeam>,
    @InjectRepository(Tournament)
    private readonly tournaments: Repository<Tournament>,
    @InjectRepository(Team)
    private readonly teams: Repository<Team>,
  ) {}

  findByTournament(tournamentId: string): Promise<TournamentTeam[]> {
    return this.registrations.find({
      where: { tournamentId },
      relations: { team: true },
      order: { registeredAt: 'ASC' },
    });
  }

  async register(
    tournamentId: string,
    dto: RegisterTeamDto,
  ): Promise<TournamentTeam> {
    const tournament = await this.tournaments.findOne({
      where: { id: tournamentId },
    });
    if (!tournament) {
      throw new NotFoundException('Torneo no encontrado');
    }

    const team = await this.teams.findOne({ where: { id: dto.teamId } });
    if (!team) {
      throw new NotFoundException('Equipo no encontrado');
    }

    const existing = await this.registrations.findOne({
      where: { tournamentId, teamId: dto.teamId },
    });
    if (existing) {
      throw new ConflictException(
        'El equipo ya está inscrito en este torneo',
      );
    }

    const registration = this.registrations.create({
      tournamentId,
      teamId: dto.teamId,
    });
    return this.registrations.save(registration);
  }

  async updateStatus(
    tournamentId: string,
    teamId: string,
    dto: UpdateRegistrationDto,
  ): Promise<TournamentTeam> {
    const registration = await this.registrations.findOne({
      where: { tournamentId, teamId },
      relations: { team: true },
    });
    if (!registration) {
      throw new NotFoundException('Inscripción no encontrada');
    }

    if (dto.status !== undefined) {
      registration.status = dto.status;
    }

    return this.registrations.save(registration);
  }

  async remove(tournamentId: string, teamId: string): Promise<void> {
    const result = await this.registrations.delete({ tournamentId, teamId });
    if (!result.affected) {
      throw new NotFoundException('Inscripción no encontrada');
    }
  }

  countByTeam(teamId: string): Promise<number> {
    return this.registrations.count({ where: { teamId } });
  }
}
