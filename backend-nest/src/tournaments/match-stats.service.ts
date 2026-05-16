import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpsertMatchStatsDto } from './dto/upsert-match-stats.dto';
import { MatchStats } from './entities/match-stats.entity';
import { Match } from './entities/match.entity';

@Injectable()
export class MatchStatsService {
  constructor(
    @InjectRepository(MatchStats)
    private readonly stats: Repository<MatchStats>,
    @InjectRepository(Match)
    private readonly matches: Repository<Match>,
  ) {}

  findByMatch(matchId: string): Promise<MatchStats[]> {
    return this.stats.find({
      where: { matchId },
      order: { teamId: 'ASC' },
    });
  }

  async upsert(
    matchId: string,
    teamId: string,
    dto: UpsertMatchStatsDto,
  ): Promise<MatchStats> {
    const match = await this.matches.findOne({ where: { id: matchId } });
    if (!match) {
      throw new NotFoundException('Partido no encontrado');
    }
    if (teamId !== match.homeTeamId && teamId !== match.awayTeamId) {
      throw new BadRequestException(
        'El equipo no participa en este partido',
      );
    }

    let row = await this.stats.findOne({ where: { matchId, teamId } });
    if (!row) {
      row = this.stats.create({ matchId, teamId });
    }

    if (dto.possession !== undefined) row.possession = dto.possession;
    if (dto.shots !== undefined) row.shots = dto.shots;
    if (dto.shotsOnTarget !== undefined) row.shotsOnTarget = dto.shotsOnTarget;
    if (dto.corners !== undefined) row.corners = dto.corners;
    if (dto.fouls !== undefined) row.fouls = dto.fouls;
    if (dto.offsides !== undefined) row.offsides = dto.offsides;
    if (dto.saves !== undefined) row.saves = dto.saves;

    return this.stats.save(row);
  }
}
