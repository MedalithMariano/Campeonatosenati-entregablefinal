import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Team } from '../../teams/entities/team.entity';
import { Match } from './match.entity';

@Entity({ name: 'match_stats' })
@Index('UQ_match_stats_team', ['matchId', 'teamId'], { unique: true })
export class MatchStats {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'match_id', type: 'uuid' })
  matchId!: string;

  @ManyToOne(() => Match, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'match_id' })
  match!: Match;

  @Column({ name: 'team_id', type: 'uuid' })
  teamId!: string;

  @ManyToOne(() => Team, { onDelete: 'RESTRICT', nullable: false })
  @JoinColumn({ name: 'team_id' })
  team!: Team;

  @Column({ type: 'int', default: 0 })
  possession!: number;

  @Column({ type: 'int', default: 0 })
  shots!: number;

  @Column({ name: 'shots_on_target', type: 'int', default: 0 })
  shotsOnTarget!: number;

  @Column({ type: 'int', default: 0 })
  corners!: number;

  @Column({ type: 'int', default: 0 })
  fouls!: number;

  @Column({ type: 'int', default: 0 })
  offsides!: number;

  @Column({ type: 'int', default: 0 })
  saves!: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
