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
import { Team } from '../../teams/entities/team.entity';
import { Tournament } from './tournament.entity';

@Entity({ name: 'tournament_rosters' })
@Index('UQ_roster_team_player', ['tournamentId', 'teamId', 'playerId'], {
  unique: true,
})
@Index('UQ_roster_team_shirt', ['tournamentId', 'teamId', 'shirtNumber'], {
  unique: true,
})
@Index('UQ_roster_player_per_tournament', ['tournamentId', 'playerId'], {
  unique: true,
})
export class TournamentRoster {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tournament_id', type: 'uuid' })
  tournamentId!: string;

  @ManyToOne(() => Tournament, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'tournament_id' })
  tournament!: Tournament;

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

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
