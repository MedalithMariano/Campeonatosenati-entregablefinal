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

@Entity({ name: 'groups' })
@Index('UQ_group_phase_name', ['phaseId', 'name'], { unique: true })
export class Group {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'phase_id', type: 'uuid' })
  phaseId!: string;

  @ManyToOne(() => Phase, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'phase_id' })
  phase!: Phase;

  @Column({ length: 20 })
  name!: string;

  @Column({ type: 'int', default: 4 })
  capacity!: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
