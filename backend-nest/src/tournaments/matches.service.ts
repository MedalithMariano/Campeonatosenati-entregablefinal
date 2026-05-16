import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateMatchDto } from './dto/update-match.dto';
import { Match } from './entities/match.entity';
import { MatchStatus } from './enums/match-status.enum';

@Injectable()
export class MatchesService {
  constructor(
    @InjectRepository(Match)
    private readonly matches: Repository<Match>,
  ) {}

  findByTournament(tournamentId: string): Promise<Match[]> {
    return this.matches.find({
      where: { tournamentId },
      relations: {
        homeTeam: true,
        awayTeam: true,
        phase: true,
        group: true,
        matchDay: true,
      },
      order: {
        phase: { order: 'ASC' },
        bracketRound: 'ASC',
        bracketPosition: 'ASC',
        matchDay: { number: 'ASC' },
        kickoff: 'ASC',
      },
    });
  }

  async findById(id: string): Promise<Match> {
    const match = await this.matches.findOne({
      where: { id },
      relations: {
        homeTeam: true,
        awayTeam: true,
        phase: true,
        group: true,
        matchDay: true,
      },
    });
    if (!match) {
      throw new NotFoundException('Partido no encontrado');
    }
    return match;
  }

  async update(id: string, dto: UpdateMatchDto): Promise<Match> {
    const match = await this.findById(id);

    if (dto.kickoff !== undefined) {
      match.kickoff = dto.kickoff ? new Date(dto.kickoff) : null;
    }
    if (dto.venue !== undefined) match.venue = dto.venue ?? null;
    if (dto.homeFormation !== undefined)
      match.homeFormation = dto.homeFormation ?? null;
    if (dto.awayFormation !== undefined)
      match.awayFormation = dto.awayFormation ?? null;
    if (dto.homeScore !== undefined) match.homeScore = dto.homeScore ?? null;
    if (dto.awayScore !== undefined) match.awayScore = dto.awayScore ?? null;
    if (dto.homePenalties !== undefined)
      match.homePenalties = dto.homePenalties ?? null;
    if (dto.awayPenalties !== undefined)
      match.awayPenalties = dto.awayPenalties ?? null;
    if (dto.status !== undefined) match.status = dto.status;

    if (match.status === MatchStatus.FINISHED) {
      this.assertFinishable(match);
    }

    const saved = await this.matches.save(match);

    if (saved.status === MatchStatus.FINISHED) {
      await this.propagateBracket(saved);
    }

    return saved;
  }

  private assertFinishable(match: Match): void {
    if (match.homeTeamId == null || match.awayTeamId == null) {
      throw new BadRequestException(
        'No se puede finalizar un partido sin ambos equipos asignados',
      );
    }
    if (match.homeScore == null || match.awayScore == null) {
      throw new BadRequestException(
        'Para finalizar el partido se requieren los goles de ambos equipos',
      );
    }
    const isKnockout = match.bracketRound != null;
    if (
      isKnockout &&
      match.homeScore === match.awayScore &&
      (match.homePenalties == null || match.awayPenalties == null)
    ) {
      throw new BadRequestException(
        'Empate en eliminatoria: ingresa los penales para definir al ganador',
      );
    }
  }

  private async propagateBracket(match: Match): Promise<void> {
    if (match.homeTeamId == null || match.awayTeamId == null) return;
    if (match.homeScore == null || match.awayScore == null) return;

    const winnerId = this.resolveWinner(match);
    if (!winnerId) return;

    const children = await this.matches.find({
      where: [
        { parentHomeMatchId: match.id },
        { parentAwayMatchId: match.id },
      ],
    });

    for (const child of children) {
      let dirty = false;
      if (child.parentHomeMatchId === match.id && child.homeTeamId !== winnerId) {
        child.homeTeamId = winnerId;
        dirty = true;
      }
      if (child.parentAwayMatchId === match.id && child.awayTeamId !== winnerId) {
        child.awayTeamId = winnerId;
        dirty = true;
      }
      if (dirty) await this.matches.save(child);
    }
  }

  private resolveWinner(match: Match): string | null {
    if (match.homeScore == null || match.awayScore == null) return null;
    if (match.homeScore > match.awayScore) return match.homeTeamId;
    if (match.awayScore > match.homeScore) return match.awayTeamId;
    // Empate
    if (match.homePenalties != null && match.awayPenalties != null) {
      if (match.homePenalties > match.awayPenalties) return match.homeTeamId;
      if (match.awayPenalties > match.homePenalties) return match.awayTeamId;
    }
    return null;
  }
}
