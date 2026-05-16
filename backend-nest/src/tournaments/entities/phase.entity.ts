import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PhaseType } from '../enums/phase-type.enum';
import { Tournament } from './tournament.entity';

@Entity({ name: 'phases' })
@Index('UQ_phase_order', ['tournamentId', 'order'], { unique: true })
export class Phase {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tournament_id', type: 'uuid' })
  tournamentId!: string;

  @ManyToOne(() => Tournament, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'tournament_id' })
  tournament!: Tournament;

  @Column({ length: 80 })
  name!: string;

  @Column({ type: 'enum', enum: PhaseType })
  type!: PhaseType;

  @Column({ type: 'int' })
  order!: number;

  @Column({ type: 'int', default: 1 })
  legs!: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
