import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Player } from '../../players/entities/player.entity';
import { Team } from '../../teams/entities/team.entity';
import { MatchEventType } from '../enums/match-event-type.enum';
import { Match } from './match.entity';

@Entity({ name: 'match_events' })
export class MatchEvent {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'match_id', type: 'uuid' })
  matchId!: string;

  @ManyToOne(() => Match, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'match_id' })
  match!: Match;

  @Column({ type: 'enum', enum: MatchEventType })
  type!: MatchEventType;

  @Column({ type: 'int' })
  minute!: number;

  @Column({ name: 'added_minute', type: 'int', nullable: true })
  addedMinute!: number | null;

  @Column({ name: 'team_id', type: 'uuid' })
  teamId!: string;

  @ManyToOne(() => Team, { onDelete: 'RESTRICT', nullable: false })
  @JoinColumn({ name: 'team_id' })
  team!: Team;

  @Column({ name: 'player_id', type: 'uuid' })
  playerId!: string;

  @ManyToOne(() => Player, { onDelete: 'RESTRICT', nullable: false })
  @JoinColumn({ name: 'player_id' })
  player!: Player;

  @Column({ name: 'related_player_id', type: 'uuid', nullable: true })
  relatedPlayerId!: string | null;

  @ManyToOne(() => Player, { onDelete: 'RESTRICT', nullable: true })
  @JoinColumn({ name: 'related_player_id' })
  relatedPlayer!: Player | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  notes!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
