import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { CreateMatchEventDto } from './dto/create-match-event.dto';
import { MatchEvent } from './entities/match-event.entity';
import { Match } from './entities/match.entity';
import {
  MatchEventType,
  SCORING_EVENTS,
} from './enums/match-event-type.enum';

@Injectable()
export class MatchEventsService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  findByMatch(matchId: string): Promise<MatchEvent[]> {
    return this.dataSource.getRepository(MatchEvent).find({
      where: { matchId },
      relations: { player: true, relatedPlayer: true, team: true },
      order: { minute: 'ASC', addedMinute: 'ASC', createdAt: 'ASC' },
    });
  }

  create(matchId: string, dto: CreateMatchEventDto): Promise<MatchEvent> {
    return this.dataSource.transaction(async (manager) => {
      const match = await this.loadMatchOrFail(manager, matchId);
      this.assertTeamBelongsToMatch(match, dto.teamId);

      const event = manager.getRepository(MatchEvent).create({
        matchId,
        type: dto.type,
        minute: dto.minute,
        addedMinute: dto.addedMinute ?? null,
        teamId: dto.teamId,
        playerId: dto.playerId,
        relatedPlayerId: dto.relatedPlayerId ?? null,
        notes: dto.notes ?? null,
      });
      const saved = await manager.getRepository(MatchEvent).save(event);

      if (SCORING_EVENTS.has(saved.type)) {
        await this.adjustScore(manager, match, saved, +1);
      }

      return saved;
    });
  }

  remove(matchId: string, eventId: string): Promise<void> {
    return this.dataSource.transaction(async (manager) => {
      const event = await manager.getRepository(MatchEvent).findOne({
        where: { id: eventId, matchId },
      });
      if (!event) {
        throw new NotFoundException('Evento no encontrado');
      }
      const match = await this.loadMatchOrFail(manager, matchId);

      if (SCORING_EVENTS.has(event.type)) {
        await this.adjustScore(manager, match, event, -1);
      }

      await manager.getRepository(MatchEvent).delete({ id: eventId });
    });
  }

  private async loadMatchOrFail(
    manager: EntityManager,
    matchId: string,
  ): Promise<Match> {
    const match = await manager.getRepository(Match).findOne({
      where: { id: matchId },
    });
    if (!match) {
      throw new NotFoundException('Partido no encontrado');
    }
    if (match.homeTeamId == null || match.awayTeamId == null) {
      throw new BadRequestException(
        'El partido no tiene ambos equipos asignados todavía',
      );
    }
    return match;
  }

  private assertTeamBelongsToMatch(match: Match, teamId: string): void {
    if (teamId !== match.homeTeamId && teamId !== match.awayTeamId) {
      throw new BadRequestException(
        'El equipo no participa en este partido',
      );
    }
  }

  private async adjustScore(
    manager: EntityManager,
    match: Match,
    event: MatchEvent,
    delta: number,
  ): Promise<void> {
    // OWN_GOAL: cuenta para el rival del equipo que comete el autogol.
    const isOwnGoal = event.type === MatchEventType.OWN_GOAL;
    const creditedTeamId = isOwnGoal
      ? event.teamId === match.homeTeamId
        ? match.awayTeamId
        : match.homeTeamId
      : event.teamId;

    const isHome = creditedTeamId === match.homeTeamId;
    const current = isHome ? (match.homeScore ?? 0) : (match.awayScore ?? 0);
    const next = Math.max(0, current + delta);
    if (isHome) match.homeScore = next;
    else match.awayScore = next;

    await manager.getRepository(Match).save(match);
  }
}
