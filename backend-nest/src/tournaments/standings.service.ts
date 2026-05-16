import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Team } from '../teams/entities/team.entity';
import { Group } from './entities/group.entity';
import { Match } from './entities/match.entity';
import { Phase } from './entities/phase.entity';
import { MatchStatus } from './enums/match-status.enum';
import { PhaseType } from './enums/phase-type.enum';

export interface StandingRow {
  teamId: string;
  team?: Pick<Team, 'id' | 'name' | 'shortName' | 'logoUrl'>;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export interface StandingsBlock {
  phaseId: string;
  phaseName: string;
  phaseType: PhaseType;
  groupId: string | null;
  groupName: string | null;
  rows: StandingRow[];
}

@Injectable()
export class StandingsService {
  constructor(
    @InjectRepository(Phase) private readonly phases: Repository<Phase>,
    @InjectRepository(Group) private readonly groups: Repository<Group>,
    @InjectRepository(Match) private readonly matches: Repository<Match>,
    @InjectRepository(Team) private readonly teams: Repository<Team>,
  ) {}

  async forTournament(tournamentId: string): Promise<StandingsBlock[]> {
    const phases = await this.phases.find({
      where: { tournamentId },
      order: { order: 'ASC' },
    });

    const blocks: StandingsBlock[] = [];

    for (const phase of phases) {
      if (phase.type === PhaseType.LEAGUE) {
        const rows = await this.computeRows(phase.id, null);
        blocks.push({
          phaseId: phase.id,
          phaseName: phase.name,
          phaseType: phase.type,
          groupId: null,
          groupName: null,
          rows,
        });
      } else if (phase.type === PhaseType.GROUP_STAGE) {
        const groups = await this.groups.find({
          where: { phaseId: phase.id },
          order: { name: 'ASC' },
        });
        for (const group of groups) {
          const rows = await this.computeRows(phase.id, group.id);
          blocks.push({
            phaseId: phase.id,
            phaseName: phase.name,
            phaseType: phase.type,
            groupId: group.id,
            groupName: group.name,
            rows,
          });
        }
      }
    }

    return blocks;
  }

  private async computeRows(
    phaseId: string,
    groupId: string | null,
  ): Promise<StandingRow[]> {
    const matches = await this.matches.find({
      where: {
        phaseId,
        ...(groupId ? { groupId } : {}),
        status: MatchStatus.FINISHED,
      },
    });

    const rows = new Map<string, StandingRow>();
    const ensureRow = (teamId: string): StandingRow => {
      const existing = rows.get(teamId);
      if (existing) return existing;
      const row: StandingRow = {
        teamId,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0,
      };
      rows.set(teamId, row);
      return row;
    };

    for (const match of matches) {
      if (
        match.homeTeamId == null ||
        match.awayTeamId == null ||
        match.homeScore == null ||
        match.awayScore == null
      ) {
        continue;
      }
      const home = ensureRow(match.homeTeamId);
      const away = ensureRow(match.awayTeamId);

      home.played++;
      away.played++;
      home.goalsFor += match.homeScore;
      home.goalsAgainst += match.awayScore;
      away.goalsFor += match.awayScore;
      away.goalsAgainst += match.homeScore;

      if (match.homeScore > match.awayScore) {
        home.won++;
        away.lost++;
        home.points += 3;
      } else if (match.homeScore < match.awayScore) {
        away.won++;
        home.lost++;
        away.points += 3;
      } else {
        home.drawn++;
        away.drawn++;
        home.points += 1;
        away.points += 1;
      }
    }

    for (const row of rows.values()) {
      row.goalDifference = row.goalsFor - row.goalsAgainst;
    }

    // Hidratar info del equipo
    const teamIds = Array.from(rows.keys());
    if (teamIds.length > 0) {
      const teams = await this.teams.find({ where: { id: In(teamIds) } });
      const byId = new Map(teams.map((t) => [t.id, t]));
      for (const row of rows.values()) {
        const t = byId.get(row.teamId);
        if (t) {
          row.team = {
            id: t.id,
            name: t.name,
            shortName: t.shortName,
            logoUrl: t.logoUrl,
          };
        }
      }
    }

    return [...rows.values()].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference)
        return b.goalDifference - a.goalDifference;
      if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
      return (a.team?.name ?? '').localeCompare(b.team?.name ?? '');
    });
  }
}
