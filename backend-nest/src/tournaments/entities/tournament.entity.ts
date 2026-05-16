import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TournamentFormat } from '../enums/tournament-format.enum';
import { TournamentStatus } from '../enums/tournament-status.enum';

@Entity({ name: 'tournaments' })
export class Tournament {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ length: 20 })
  season!: string;

  @Column({ type: 'enum', enum: TournamentFormat })
  format!: TournamentFormat;

  @Column({
    type: 'enum',
    enum: TournamentStatus,
    default: TournamentStatus.DRAFT,
  })
  status!: TournamentStatus;

  @Column({ name: 'points_win', type: 'int', default: 3 })
  pointsWin!: number;

  @Column({ name: 'points_draw', type: 'int', default: 1 })
  pointsDraw!: number;

  @Column({ name: 'points_loss', type: 'int', default: 0 })
  pointsLoss!: number;

  @Column({ name: 'min_players_per_roster', type: 'int', default: 11 })
  minPlayersPerRoster!: number;

  @Column({ name: 'max_players_per_roster', type: 'int', default: 25 })
  maxPlayersPerRoster!: number;

  @Column({ name: 'start_date', type: 'date', nullable: true })
  startDate!: string | null;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate!: string | null;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ name: 'banner_url', nullable: true, type: 'varchar' })
  bannerUrl!: string | null;

  @Column({ name: 'banner_public_id', nullable: true, type: 'varchar' })
  bannerPublicId!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
