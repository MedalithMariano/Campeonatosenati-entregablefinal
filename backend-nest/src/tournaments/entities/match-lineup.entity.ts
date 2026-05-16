import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Player } from '../../players/entities/player.entity';
import { PlayerPosition } from '../../players/enums/player-position.enum';
import { Team } from '../../teams/entities/team.entity';
import { Match } from './match.entity';

@Entity({ name: 'match_lineups' })
@Index('UQ_match_lineup_player', ['matchId', 'teamId', 'playerId'], {
  unique: true,
})
@Index('UQ_match_lineup_shirt', ['matchId', 'teamId', 'shirtNumber'], {
  unique: true,
})
export class MatchLineup {
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

  @Column({ name: 'player_id', type: 'uuid' })
  playerId!: string;

  @ManyToOne(() => Player, { onDelete: 'RESTRICT', nullable: false })
  @JoinColumn({ name: 'player_id' })
  player!: Player;

  @Column({ name: 'shirt_number', type: 'int' })
  shirtNumber!: number;

  @Column({ type: 'enum', enum: PlayerPosition })
  position!: PlayerPosition;

  @Column({ name: 'is_starter', type: 'boolean', default: true })
  isStarter!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
