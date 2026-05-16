import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { LineupEntryDto, SetLineupDto } from './dto/set-lineup.dto';
import { MatchLineup } from './entities/match-lineup.entity';
import { Match } from './entities/match.entity';

@Injectable()
export class MatchLineupsService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  findByMatch(matchId: string): Promise<MatchLineup[]> {
    return this.dataSource.getRepository(MatchLineup).find({
      where: { matchId },
      relations: { player: true, team: true },
      order: {
        teamId: 'ASC',
        isStarter: 'DESC',
        position: 'ASC',
        shirtNumber: 'ASC',
      },
    });
  }

  setLineup(
    matchId: string,
    teamId: string,
    dto: SetLineupDto,
  ): Promise<MatchLineup[]> {
    return this.dataSource.transaction(async (manager) => {
      const match = await manager.getRepository(Match).findOne({
        where: { id: matchId },
      });
      if (!match) {
        throw new NotFoundException('Partido no encontrado');
      }
      if (teamId !== match.homeTeamId && teamId !== match.awayTeamId) {
        throw new BadRequestException(
          'El equipo no participa en este partido',
        );
      }

      this.assertNoDuplicateShirts(dto.entries);
      this.assertNoDuplicatePlayers(dto.entries);

      const repo = manager.getRepository(MatchLineup);
      await repo.delete({ matchId, teamId });

      const created = dto.entries.map((e) =>
        repo.create({
          matchId,
          teamId,
          playerId: e.playerId,
          shirtNumber: e.shirtNumber,
          position: e.position,
          isStarter: e.isStarter,
        }),
      );
      return repo.save(created);
    });
  }

  private assertNoDuplicateShirts(entries: LineupEntryDto[]): void {
    const shirts = new Set<number>();
    for (const e of entries) {
      if (shirts.has(e.shirtNumber)) {
        throw new ConflictException(
          `Dorsal ${e.shirtNumber} duplicado en la alineación`,
        );
      }
      shirts.add(e.shirtNumber);
    }
  }

  private assertNoDuplicatePlayers(entries: LineupEntryDto[]): void {
    const players = new Set<string>();
    for (const e of entries) {
      if (players.has(e.playerId)) {
        throw new ConflictException(
          'Hay jugadores duplicados en la alineación',
        );
      }
      players.add(e.playerId);
    }
  }
}
