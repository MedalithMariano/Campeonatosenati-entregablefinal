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
import { Group } from './group.entity';

@Entity({ name: 'group_teams' })
@Index('UQ_group_team', ['groupId', 'teamId'], { unique: true })
export class GroupTeam {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'group_id', type: 'uuid' })
  groupId!: string;

  @ManyToOne(() => Group, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'group_id' })
  group!: Group;

  @Column({ name: 'team_id', type: 'uuid' })
  teamId!: string;

  @ManyToOne(() => Team, { onDelete: 'RESTRICT', nullable: false })
  @JoinColumn({ name: 'team_id' })
  team!: Team;

  @Column({ type: 'int', nullable: true })
  seed!: number | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
