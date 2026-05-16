import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { GroupTeam } from './entities/group-team.entity';
import { Group } from './entities/group.entity';
import { MatchDay } from './entities/match-day.entity';
import { Match } from './entities/match.entity';
import { Phase } from './entities/phase.entity';
import { TournamentTeam } from './entities/tournament-team.entity';
import { Tournament } from './entities/tournament.entity';
import { MatchStatus } from './enums/match-status.enum';
import { PhaseType } from './enums/phase-type.enum';
import { RegistrationStatus } from './enums/registration-status.enum';
import { TournamentFormat } from './enums/tournament-format.enum';
import { StandingsService } from './standings.service';

interface BergerPair {
  home: string | null;
  away: string | null;
}

@Injectable()
export class FixtureService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly standings: StandingsService,
  ) {}

  async generate(tournamentId: string): Promise<{ phasesCreated: number; matchesCreated: number }> {
    return this.dataSource.transaction(async (manager) => {
      const tournament = await manager.getRepository(Tournament).findOne({
        where: { id: tournamentId },
      });
      if (!tournament) {
        throw new NotFoundException('Torneo no encontrado');
      }

      const existingMatches = await manager.getRepository(Match).count({
        where: { tournamentId },
      });
      if (existingMatches > 0) {
        throw new ConflictException(
          'El torneo ya tiene fixture generado. Bórralo primero con DELETE /tournaments/:id/fixture.',
        );
      }

      const registrations = await manager.getRepository(TournamentTeam).find({
        where: { tournamentId, status: RegistrationStatus.APPROVED },
      });
      const teamIds = registrations.map((r) => r.teamId);

      if (teamIds.length < 2) {
        throw new BadRequestException(
          'Se necesitan al menos 2 equipos inscritos para generar fixture',
        );
      }

      let phases = 0;
      let matches = 0;

      if (tournament.format === TournamentFormat.LEAGUE) {
        const result = await this.generateLeague(manager, tournamentId, teamIds);
        phases += result.phases;
        matches += result.matches;
      } else if (tournament.format === TournamentFormat.KNOCKOUT) {
        const result = await this.generateKnockout(
          manager,
          tournamentId,
          teamIds,
        );
        phases += result.phases;
        matches += result.matches;
      } else if (tournament.format === TournamentFormat.GROUPS_KNOCKOUT) {
        const result = await this.generateGroupsKnockout(
          manager,
          tournamentId,
          teamIds,
        );
        phases += result.phases;
        matches += result.matches;
      }

      return { phasesCreated: phases, matchesCreated: matches };
    });
  }

  async drop(tournamentId: string): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      await manager.getRepository(Match).delete({ tournamentId });
      const phaseRepo = manager.getRepository(Phase);
      const phases = await phaseRepo.find({ where: { tournamentId } });
      if (phases.length > 0) {
        await phaseRepo.delete(phases.map((p) => p.id));
      }
    });
  }

  // ----- LEAGUE -----

  private async generateLeague(
    manager: import('typeorm').EntityManager,
    tournamentId: string,
    teamIds: string[],
  ): Promise<{ phases: number; matches: number }> {
    const phase = await manager.getRepository(Phase).save({
      tournamentId,
      name: 'Liga',
      type: PhaseType.LEAGUE,
      order: 1,
      legs: 2,
    });

    const matches = await this.createRoundRobinMatches(
      manager,
      tournamentId,
      phase,
      teamIds,
      null,
      2,
    );

    return { phases: 1, matches };
  }

  // ----- KNOCKOUT puro -----

  private async generateKnockout(
    manager: import('typeorm').EntityManager,
    tournamentId: string,
    teamIds: string[],
  ): Promise<{ phases: number; matches: number }> {
    const n = teamIds.length;
    if (!isPowerOfTwo(n)) {
      throw new BadRequestException(
        `KNOCKOUT requiere un número de equipos potencia de 2 (2, 4, 8, 16, 32). Hay ${n} inscritos.`,
      );
    }

    const result = await this.createBracket(manager, tournamentId, teamIds, 1);
    return result;
  }

  // ----- GROUPS_KNOCKOUT -----

  private async generateGroupsKnockout(
    manager: import('typeorm').EntityManager,
    tournamentId: string,
    teamIds: string[],
  ): Promise<{ phases: number; matches: number }> {
    const groups = await manager.getRepository(Group).find({
      relations: { phase: true },
      where: { phase: { tournamentId, type: PhaseType.GROUP_STAGE } },
    });
    if (groups.length === 0) {
      throw new BadRequestException(
        'Crea primero la fase de grupos y los grupos antes de generar el fixture',
      );
    }

    const phase = groups[0].phase;
    const groupTeams = await manager.getRepository(GroupTeam).find({
      where: { groupId: In(groups.map((g) => g.id)) },
    });

    const assignedTeamIds = new Set(groupTeams.map((gt) => gt.teamId));
    const missing = teamIds.filter((id) => !assignedTeamIds.has(id));
    if (missing.length > 0) {
      throw new BadRequestException(
        `Hay ${missing.length} equipo(s) inscrito(s) sin asignar a un grupo. Asígnalos antes de generar.`,
      );
    }

    let totalMatches = 0;
    let totalPhases = 1;

    // Round-robin por grupo (1 vuelta).
    for (const group of groups) {
      const teamsInGroup = groupTeams
        .filter((gt) => gt.groupId === group.id)
        .map((gt) => gt.teamId);
      if (teamsInGroup.length < 2) continue;
      const matchesCreated = await this.createRoundRobinMatches(
        manager,
        tournamentId,
        phase,
        teamsInGroup,
        group.id,
        1,
      );
      totalMatches += matchesCreated;
    }

    // Bracket KO con slots vacíos (se popular después con los clasificados).
    const qualifiersPerGroup = 2;
    const knockoutSize = groups.length * qualifiersPerGroup;
    if (isPowerOfTwo(knockoutSize) && knockoutSize >= 2) {
      const bracket = await this.createBracket(
        manager,
        tournamentId,
        new Array<string>(knockoutSize).fill(''),
        phase.order + 1,
      );
      totalPhases += bracket.phases;
      totalMatches += bracket.matches;
    }

    return { phases: totalPhases, matches: totalMatches };
  }

  // ----- Helpers compartidos -----

  /** Genera round-robin Berger para `teamIds`. Si legs=2, duplica con local/visitante invertido. */
  private async createRoundRobinMatches(
    manager: import('typeorm').EntityManager,
    tournamentId: string,
    phase: Phase,
    teamIds: string[],
    groupId: string | null,
    legs: number,
  ): Promise<number> {
    const rounds = bergerRounds(teamIds);
    const matchRepo = manager.getRepository(Match);
    const matchDayRepo = manager.getRepository(MatchDay);

    let total = 0;
    let dayNumber = 1;

    for (let leg = 0; leg < legs; leg++) {
      for (let r = 0; r < rounds.length; r++) {
        const round = rounds[r];
        const matchDay = await matchDayRepo.save({
          phaseId: phase.id,
          number: dayNumber,
          date: null,
        });

        for (const pair of round) {
          if (!pair.home || !pair.away) continue; // bye
          const home = leg === 0 ? pair.home : pair.away;
          const away = leg === 0 ? pair.away : pair.home;

          await matchRepo.save({
            tournamentId,
            phaseId: phase.id,
            groupId,
            matchDayId: matchDay.id,
            homeTeamId: home,
            awayTeamId: away,
            status: MatchStatus.SCHEDULED,
          });
          total++;
        }
        dayNumber++;
      }
    }
    return total;
  }

  /** Crea el bracket KO. teamIds vacíos (cadena '') quedan como slots nulos. */
  private async createBracket(
    manager: import('typeorm').EntityManager,
    tournamentId: string,
    teamIds: string[],
    startingPhaseOrder: number,
  ): Promise<{ phases: number; matches: number }> {
    const n = teamIds.length;
    const totalRounds = Math.log2(n);
    if (!Number.isInteger(totalRounds)) {
      throw new BadRequestException(
        'El número de slots de bracket debe ser potencia de 2',
      );
    }

    const phaseTypeByRemaining: Record<number, PhaseType> = {
      16: PhaseType.ROUND_OF_16,
      8: PhaseType.QUARTERFINAL,
      4: PhaseType.SEMIFINAL,
      2: PhaseType.FINAL,
    };
    const phaseNameByRemaining: Record<number, string> = {
      16: 'Octavos de final',
      8: 'Cuartos de final',
      4: 'Semifinales',
      2: 'Final',
    };

    const phaseRepo = manager.getRepository(Phase);
    const matchRepo = manager.getRepository(Match);

    let phasesCreated = 0;
    let matchesCreated = 0;
    let order = startingPhaseOrder;

    // Generamos primero las phases en orden y guardamos los ids para vincular padres.
    const phasesByRound: Phase[] = [];
    for (let round = 1; round <= totalRounds; round++) {
      const remaining = 2 ** (totalRounds - round + 1);
      const type = phaseTypeByRemaining[remaining] ?? PhaseType.FINAL;
      const name = phaseNameByRemaining[remaining] ?? 'Final';
      const phase = await phaseRepo.save({
        tournamentId,
        name,
        type,
        order: order++,
        legs: 1,
      });
      phasesByRound.push(phase);
      phasesCreated++;
    }

    // Ronda 1: crea matches con teams reales (o null si slot vacío).
    let prevRoundMatches: Match[] = [];
    const firstRound = phasesByRound[0];
    const firstMatchesCount = n / 2;
    for (let i = 0; i < firstMatchesCount; i++) {
      const home = teamIds[2 * i] || null;
      const away = teamIds[2 * i + 1] || null;
      const match = await matchRepo.save({
        tournamentId,
        phaseId: firstRound.id,
        homeTeamId: home,
        awayTeamId: away,
        bracketRound: 1,
        bracketPosition: i + 1,
        status: MatchStatus.SCHEDULED,
      });
      prevRoundMatches.push(match);
      matchesCreated++;
    }

    // Rondas 2..N: matches con parent pointers.
    for (let round = 2; round <= totalRounds; round++) {
      const phase = phasesByRound[round - 1];
      const matchesInRound = prevRoundMatches.length / 2;
      const nextRoundMatches: Match[] = [];
      for (let i = 0; i < matchesInRound; i++) {
        const parentHome = prevRoundMatches[2 * i];
        const parentAway = prevRoundMatches[2 * i + 1];
        const match = await matchRepo.save({
          tournamentId,
          phaseId: phase.id,
          parentHomeMatchId: parentHome.id,
          parentAwayMatchId: parentAway.id,
          bracketRound: round,
          bracketPosition: i + 1,
          status: MatchStatus.SCHEDULED,
        });
        nextRoundMatches.push(match);
        matchesCreated++;
      }
      prevRoundMatches = nextRoundMatches;
    }

    return { phases: phasesCreated, matches: matchesCreated };
  }

  /**
   * Para torneos GROUPS_KNOCKOUT: tras cerrar la fase de grupos, popula los
   * slots de la primera ronda del bracket con el top 2 de cada grupo siguiendo
   * seeding cruzado (1A↔2B, 1B↔2A, 1C↔2D, 1D↔2C, ...).
   */
  async seedKnockoutFromGroups(
    tournamentId: string,
  ): Promise<{ matchesUpdated: number }> {
    return this.dataSource.transaction(async (manager) => {
      const tournament = await manager.getRepository(Tournament).findOne({
        where: { id: tournamentId },
      });
      if (!tournament) {
        throw new NotFoundException('Torneo no encontrado');
      }
      if (tournament.format !== TournamentFormat.GROUPS_KNOCKOUT) {
        throw new BadRequestException(
          'Solo aplica a torneos GROUPS_KNOCKOUT',
        );
      }

      const groupPhase = await manager.getRepository(Phase).findOne({
        where: { tournamentId, type: PhaseType.GROUP_STAGE },
      });
      if (!groupPhase) {
        throw new BadRequestException(
          'No hay fase de grupos creada para este torneo',
        );
      }

      // Validar que todos los partidos de grupos están FINISHED
      const totalGroupMatches = await manager.getRepository(Match).count({
        where: { tournamentId, phaseId: groupPhase.id },
      });
      const finishedGroupMatches = await manager.getRepository(Match).count({
        where: {
          tournamentId,
          phaseId: groupPhase.id,
          status: MatchStatus.FINISHED,
        },
      });
      if (totalGroupMatches === 0) {
        throw new BadRequestException(
          'La fase de grupos no tiene partidos generados',
        );
      }
      if (finishedGroupMatches < totalGroupMatches) {
        throw new BadRequestException(
          `Aún faltan ${totalGroupMatches - finishedGroupMatches} partido(s) por finalizar en la fase de grupos`,
        );
      }

      // Standings por grupo
      const allBlocks = await this.standings.forTournament(tournamentId);
      const groupBlocks = allBlocks
        .filter((b) => b.phaseId === groupPhase.id && b.groupId != null)
        .sort((a, b) =>
          (a.groupName ?? '').localeCompare(b.groupName ?? ''),
        );

      if (groupBlocks.length === 0) {
        throw new BadRequestException(
          'No se pudieron calcular las posiciones de los grupos',
        );
      }

      // Top 2 de cada grupo
      const seeds: Array<{ first: string; second: string }> = [];
      for (const block of groupBlocks) {
        if (block.rows.length < 2) {
          throw new BadRequestException(
            `El grupo ${block.groupName} no tiene suficientes equipos para clasificar 2`,
          );
        }
        seeds.push({
          first: block.rows[0].teamId,
          second: block.rows[1].teamId,
        });
      }

      // Cruces clásicos: para grupo i, su 1° enfrenta al 2° del grupo "compañero".
      // Compañero de A=B, C=D, E=F, ... → seeds pareados de a 2.
      const slots: Array<{ home: string; away: string }> = [];
      for (let i = 0; i < seeds.length; i += 2) {
        const a = seeds[i];
        const b = seeds[i + 1];
        if (!b) {
          throw new BadRequestException(
            'El número de grupos debe ser par para sembrar el bracket',
          );
        }
        slots.push({ home: a.first, away: b.second });
        slots.push({ home: b.first, away: a.second });
      }

      // Cargar la primera ronda del bracket (siguiente fase del torneo después
      // de la GROUP_STAGE) y asignar los teams en orden de bracketPosition.
      const firstBracketRound = await manager.getRepository(Match).find({
        where: { tournamentId, bracketRound: 1 },
        order: { bracketPosition: 'ASC' },
      });

      if (firstBracketRound.length !== slots.length) {
        throw new BadRequestException(
          `El bracket esperaba ${firstBracketRound.length} partido(s) pero hay ${slots.length} cruces calculados. Regenera el fixture.`,
        );
      }

      let matchesUpdated = 0;
      for (let i = 0; i < firstBracketRound.length; i++) {
        const match = firstBracketRound[i];
        const slot = slots[i];
        if (
          match.homeTeamId !== slot.home ||
          match.awayTeamId !== slot.away
        ) {
          match.homeTeamId = slot.home;
          match.awayTeamId = slot.away;
          await manager.getRepository(Match).save(match);
          matchesUpdated++;
        }
      }

      return { matchesUpdated };
    });
  }
}

function isPowerOfTwo(n: number): boolean {
  return n >= 1 && (n & (n - 1)) === 0;
}

function bergerRounds(teamIds: string[]): BergerPair[][] {
  const teams: (string | null)[] = [...teamIds];
  if (teams.length % 2 !== 0) teams.push(null);
  const n = teams.length;
  const halves = n / 2;
  const rounds = n - 1;
  const result: BergerPair[][] = [];

  const fixed = teams[0];
  let rotating = teams.slice(1);

  for (let r = 0; r < rounds; r++) {
    const round: BergerPair[] = [];
    const opponent = rotating[rotating.length - 1];
    if (r % 2 === 0) {
      round.push({ home: fixed, away: opponent });
    } else {
      round.push({ home: opponent, away: fixed });
    }
    for (let i = 0; i < halves - 1; i++) {
      round.push({
        home: rotating[i],
        away: rotating[rotating.length - 2 - i],
      });
    }
    result.push(round);
    rotating = [rotating[rotating.length - 1], ...rotating.slice(0, -1)];
  }
  return result;
}

// Import nombrado al final para evitar ciclos accidentales.
import { In } from 'typeorm';
