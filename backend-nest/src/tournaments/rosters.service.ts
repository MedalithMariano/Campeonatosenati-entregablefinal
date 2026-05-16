import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Player } from '../players/entities/player.entity';
import { AddRosterEntryDto } from './dto/add-roster-entry.dto';
import { UpdateRosterEntryDto } from './dto/update-roster-entry.dto';
import { TournamentRoster } from './entities/tournament-roster.entity';
import { TournamentTeam } from './entities/tournament-team.entity';
import { Tournament } from './entities/tournament.entity';

export interface RosterValidation {
  count: number;
  min: number;
  max: number;
  belowMin: boolean;
  aboveMax: boolean;
}

@Injectable()
export class RostersService {
  constructor(
    @InjectRepository(TournamentRoster)
    private readonly rosters: Repository<TournamentRoster>,
    @InjectRepository(TournamentTeam)
    private readonly registrations: Repository<TournamentTeam>,
    @InjectRepository(Tournament)
    private readonly tournaments: Repository<Tournament>,
    @InjectRepository(Player)
    private readonly players: Repository<Player>,
  ) {}

  findByTeam(
    tournamentId: string,
    teamId: string,
  ): Promise<TournamentRoster[]> {
    return this.rosters.find({
      where: { tournamentId, teamId },
      relations: { player: true },
      order: { shirtNumber: 'ASC' },
    });
  }

  async addEntry(
    tournamentId: string,
    teamId: string,
    dto: AddRosterEntryDto,
  ): Promise<TournamentRoster> {
    await this.assertRegistered(tournamentId, teamId);

    const player = await this.players.findOne({
      where: { id: dto.playerId },
    });
    if (!player) {
      throw new NotFoundException('Jugador no encontrado');
    }

    const playerInTournament = await this.rosters.findOne({
      where: { tournamentId, playerId: dto.playerId },
    });
    if (playerInTournament) {
      throw new ConflictException(
        playerInTournament.teamId === teamId
          ? 'El jugador ya está en el roster de este equipo'
          : 'El jugador ya está inscrito en otro equipo de este torneo',
      );
    }

    const shirtTaken = await this.rosters.findOne({
      where: { tournamentId, teamId, shirtNumber: dto.shirtNumber },
    });
    if (shirtTaken) {
      throw new ConflictException(
        `El dorsal ${dto.shirtNumber} ya está en uso`,
      );
    }

    const entry = this.rosters.create({
      tournamentId,
      teamId,
      playerId: dto.playerId,
      shirtNumber: dto.shirtNumber,
    });
    return this.rosters.save(entry);
  }

  async updateEntry(
    tournamentId: string,
    teamId: string,
    playerId: string,
    dto: UpdateRosterEntryDto,
  ): Promise<TournamentRoster> {
    const entry = await this.rosters.findOne({
      where: { tournamentId, teamId, playerId },
    });
    if (!entry) {
      throw new NotFoundException('Entrada de roster no encontrada');
    }

    if (entry.shirtNumber !== dto.shirtNumber) {
      const shirtTaken = await this.rosters.findOne({
        where: {
          tournamentId,
          teamId,
          shirtNumber: dto.shirtNumber,
          playerId: Not(playerId),
        },
      });
      if (shirtTaken) {
        throw new ConflictException(
          `El dorsal ${dto.shirtNumber} ya está en uso`,
        );
      }
    }

    entry.shirtNumber = dto.shirtNumber;
    return this.rosters.save(entry);
  }

  async removeEntry(
    tournamentId: string,
    teamId: string,
    playerId: string,
  ): Promise<void> {
    const result = await this.rosters.delete({
      tournamentId,
      teamId,
      playerId,
    });
    if (!result.affected) {
      throw new NotFoundException('Entrada de roster no encontrada');
    }
  }

  async validate(
    tournamentId: string,
    teamId: string,
  ): Promise<RosterValidation> {
    const tournament = await this.tournaments.findOne({
      where: { id: tournamentId },
    });
    if (!tournament) {
      throw new NotFoundException('Torneo no encontrado');
    }

    const count = await this.rosters.count({
      where: { tournamentId, teamId },
    });

    return {
      count,
      min: tournament.minPlayersPerRoster,
      max: tournament.maxPlayersPerRoster,
      belowMin: count < tournament.minPlayersPerRoster,
      aboveMax: count > tournament.maxPlayersPerRoster,
    };
  }

  countByPlayer(playerId: string): Promise<number> {
    return this.rosters.count({ where: { playerId } });
  }

  private async assertRegistered(
    tournamentId: string,
    teamId: string,
  ): Promise<void> {
    const registration = await this.registrations.findOne({
      where: { tournamentId, teamId },
    });
    if (!registration) {
      throw new BadRequestException(
        'El equipo no está inscrito en este torneo',
      );
    }
  }
}
