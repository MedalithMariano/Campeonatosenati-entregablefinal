import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Player } from '../players/entities/player.entity';
import { Team } from '../teams/entities/team.entity';
import { MatchEvent } from './entities/match-event.entity';
import { Match } from './entities/match.entity';
import { MatchEventType } from './enums/match-event-type.enum';

export interface LeaderRow<T> {
  playerId: string;
  teamId: string;
  player?: Pick<Player, 'id' | 'firstName' | 'lastName' | 'photoUrl'>;
  team?: Pick<Team, 'id' | 'name' | 'shortName' | 'logoUrl'>;
  count: T;
}

export interface DisciplineRow {
  playerId: string;
  teamId: string;
  player?: Pick<Player, 'id' | 'firstName' | 'lastName' | 'photoUrl'>;
  team?: Pick<Team, 'id' | 'name' | 'shortName' | 'logoUrl'>;
  yellows: number;
  reds: number;
  total: number;
}

const SCORING = [MatchEventType.GOAL, MatchEventType.PENALTY_GOAL];

@Injectable()
export class LeaderboardsService {
  constructor(
    @InjectRepository(MatchEvent)
    private readonly events: Repository<MatchEvent>,
    @InjectRepository(Match) private readonly matches: Repository<Match>,
    @InjectRepository(Player) private readonly players: Repository<Player>,
    @InjectRepository(Team) private readonly teams: Repository<Team>,
  ) {}

  async topScorers(tournamentId: string): Promise<LeaderRow<number>[]> {
    const matchIds = await this.matchIdsOfTournament(tournamentId);
    if (matchIds.length === 0) return [];

    const events = await this.events.find({
      where: { matchId: In(matchIds), type: In(SCORING) },
      select: ['playerId', 'teamId'],
    });

    const counts = new Map<string, { teamId: string; count: number }>();
    for (const e of events) {
      const key = e.playerId;
      const current = counts.get(key);
      if (current) current.count++;
      else counts.set(key, { teamId: e.teamId, count: 1 });
    }

    return this.hydrate(counts);
  }

  async topAssists(tournamentId: string): Promise<LeaderRow<number>[]> {
    const matchIds = await this.matchIdsOfTournament(tournamentId);
    if (matchIds.length === 0) return [];

    const events = await this.events
      .createQueryBuilder('e')
      .where('e.matchId IN (:...matchIds)', { matchIds })
      .andWhere('e.type IN (:...types)', { types: SCORING })
      .andWhere('e.relatedPlayerId IS NOT NULL')
      .select(['e.relatedPlayerId', 'e.teamId'])
      .getMany();

    const counts = new Map<string, { teamId: string; count: number }>();
    for (const e of events) {
      const key = e.relatedPlayerId!;
      const current = counts.get(key);
      if (current) current.count++;
      else counts.set(key, { teamId: e.teamId, count: 1 });
    }

    return this.hydrate(counts);
  }

  async discipline(tournamentId: string): Promise<DisciplineRow[]> {
    const matchIds = await this.matchIdsOfTournament(tournamentId);
    if (matchIds.length === 0) return [];

    const events = await this.events.find({
      where: {
        matchId: In(matchIds),
        type: In([
          MatchEventType.YELLOW_CARD,
          MatchEventType.RED_CARD,
          MatchEventType.SECOND_YELLOW,
        ]),
      },
      select: ['playerId', 'teamId', 'type'],
    });

    const counts = new Map<
      string,
      { teamId: string; yellows: number; reds: number }
    >();
    for (const e of events) {
      const key = e.playerId;
      const current = counts.get(key) ?? {
        teamId: e.teamId,
        yellows: 0,
        reds: 0,
      };
      if (e.type === MatchEventType.YELLOW_CARD) current.yellows++;
      else current.reds++; // RED_CARD o SECOND_YELLOW cuentan como roja
      counts.set(key, current);
    }

    const playerIds = Array.from(counts.keys());
    const teamIds = Array.from(new Set([...counts.values()].map((c) => c.teamId)));
    const [players, teams] = await Promise.all([
      this.players.find({ where: { id: In(playerIds) } }),
      this.teams.find({ where: { id: In(teamIds) } }),
    ]);
    const playerMap = new Map(players.map((p) => [p.id, p]));
    const teamMap = new Map(teams.map((t) => [t.id, t]));

    const rows: DisciplineRow[] = [];
    for (const [playerId, c] of counts) {
      const player = playerMap.get(playerId);
      const team = teamMap.get(c.teamId);
      rows.push({
        playerId,
        teamId: c.teamId,
        ...(player && {
          player: {
            id: player.id,
            firstName: player.firstName,
            lastName: player.lastName,
            photoUrl: player.photoUrl,
          },
        }),
        ...(team && {
          team: {
            id: team.id,
            name: team.name,
            shortName: team.shortName,
            logoUrl: team.logoUrl,
          },
        }),
        yellows: c.yellows,
        reds: c.reds,
        total: c.yellows + c.reds,
      });
    }

    rows.sort((a, b) => {
      if (b.reds !== a.reds) return b.reds - a.reds;
      if (b.yellows !== a.yellows) return b.yellows - a.yellows;
      return 0;
    });

    return rows;
  }

  private async matchIdsOfTournament(tournamentId: string): Promise<string[]> {
    const matches = await this.matches.find({
      where: { tournamentId },
      select: ['id'],
    });
    return matches.map((m) => m.id);
  }

  private async hydrate(
    counts: Map<string, { teamId: string; count: number }>,
  ): Promise<LeaderRow<number>[]> {
    const playerIds = Array.from(counts.keys());
    if (playerIds.length === 0) return [];
    const teamIds = Array.from(new Set([...counts.values()].map((c) => c.teamId)));

    const [players, teams] = await Promise.all([
      this.players.find({ where: { id: In(playerIds) } }),
      this.teams.find({ where: { id: In(teamIds) } }),
    ]);
    const playerMap = new Map(players.map((p) => [p.id, p]));
    const teamMap = new Map(teams.map((t) => [t.id, t]));

    const rows: LeaderRow<number>[] = [];
    for (const [playerId, info] of counts) {
      const player = playerMap.get(playerId);
      const team = teamMap.get(info.teamId);
      rows.push({
        playerId,
        teamId: info.teamId,
        ...(player && {
          player: {
            id: player.id,
            firstName: player.firstName,
            lastName: player.lastName,
            photoUrl: player.photoUrl,
          },
        }),
        ...(team && {
          team: {
            id: team.id,
            name: team.name,
            shortName: team.shortName,
            logoUrl: team.logoUrl,
          },
        }),
        count: info.count,
      });
    }

    rows.sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return (a.player?.lastName ?? '').localeCompare(b.player?.lastName ?? '');
    });

    return rows;
  }
}
