import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Team } from '../../teams/entities/team.entity';
import { MatchStatus } from '../enums/match-status.enum';
import { Group } from './group.entity';
import { MatchDay } from './match-day.entity';
import { Phase } from './phase.entity';
import { Tournament } from './tournament.entity';

@Entity({ name: 'matches' })
export class Match {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tournament_id', type: 'uuid' })
  tournamentId!: string;

  @ManyToOne(() => Tournament, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'tournament_id' })
  tournament!: Tournament;

  @Column({ name: 'phase_id', type: 'uuid' })
  phaseId!: string;

  @ManyToOne(() => Phase, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'phase_id' })
  phase!: Phase;

  @Column({ name: 'group_id', type: 'uuid', nullable: true })
  groupId!: string | null;

  @ManyToOne(() => Group, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'group_id' })
  group!: Group | null;

  @Column({ name: 'match_day_id', type: 'uuid', nullable: true })
  matchDayId!: string | null;

  @ManyToOne(() => MatchDay, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'match_day_id' })
  matchDay!: MatchDay | null;

  @Column({ name: 'home_team_id', type: 'uuid', nullable: true })
  homeTeamId!: string | null;

  @ManyToOne(() => Team, { onDelete: 'RESTRICT', nullable: true })
  @JoinColumn({ name: 'home_team_id' })
  homeTeam!: Team | null;

  @Column({ name: 'away_team_id', type: 'uuid', nullable: true })
  awayTeamId!: string | null;

  @ManyToOne(() => Team, { onDelete: 'RESTRICT', nullable: true })
  @JoinColumn({ name: 'away_team_id' })
  awayTeam!: Team | null;

  @Column({
    name: 'parent_home_match_id',
    type: 'uuid',
    nullable: true,
  })
  parentHomeMatchId!: string | null;

  @Column({
    name: 'parent_away_match_id',
    type: 'uuid',
    nullable: true,
  })
  parentAwayMatchId!: string | null;

  @Column({ name: 'bracket_round', type: 'int', nullable: true })
  bracketRound!: number | null;

  @Column({ name: 'bracket_position', type: 'int', nullable: true })
  bracketPosition!: number | null;

  @Column({ type: 'timestamptz', nullable: true })
  kickoff!: Date | null;

  @Column({ length: 120, nullable: true, type: 'varchar' })
  venue!: string | null;

  @Column({
    name: 'home_formation',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  homeFormation!: string | null;

  @Column({
    name: 'away_formation',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  awayFormation!: string | null;

  @Column({
    type: 'enum',
    enum: MatchStatus,
    default: MatchStatus.SCHEDULED,
  })
  status!: MatchStatus;

  @Column({ name: 'home_score', type: 'int', nullable: true })
  homeScore!: number | null;

  @Column({ name: 'away_score', type: 'int', nullable: true })
  awayScore!: number | null;

  @Column({ name: 'home_penalties', type: 'int', nullable: true })
  homePenalties!: number | null;

  @Column({ name: 'away_penalties', type: 'int', nullable: true })
  awayPenalties!: number | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
