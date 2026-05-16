import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Phase } from './phase.entity';

@Entity({ name: 'match_days' })
@Index('UQ_matchday_phase_number', ['phaseId', 'number'], { unique: true })
export class MatchDay {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'phase_id', type: 'uuid' })
  phaseId!: string;

  @ManyToOne(() => Phase, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'phase_id' })
  phase!: Phase;

  @Column({ type: 'int' })
  number!: number;

  @Column({ type: 'date', nullable: true })
  date!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
