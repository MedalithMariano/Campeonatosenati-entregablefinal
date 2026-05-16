import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Team } from '../../teams/entities/team.entity';
import { RegistrationStatus } from '../enums/registration-status.enum';
import { Tournament } from './tournament.entity';

@Entity({ name: 'tournament_teams' })
@Index('UQ_tournament_team', ['tournamentId', 'teamId'], { unique: true })
export class TournamentTeam {
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

  @Column({
    type: 'enum',
    enum: RegistrationStatus,
    default: RegistrationStatus.APPROVED,
  })
  status!: RegistrationStatus;

  @Column({ name: 'group_id', type: 'uuid', nullable: true })
  groupId!: string | null;

  @CreateDateColumn({ name: 'registered_at', type: 'timestamptz' })
  registeredAt!: Date;
}
