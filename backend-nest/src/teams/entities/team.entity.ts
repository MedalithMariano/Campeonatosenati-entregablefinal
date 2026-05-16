import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'teams' })
export class Team {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ name: 'short_name', nullable: true, type: 'varchar', length: 8 })
  shortName!: string | null;

  @Column({ nullable: true, type: 'varchar' })
  city!: string | null;

  @Column({ name: 'founded_year', nullable: true, type: 'int' })
  foundedYear!: number | null;

  @Column({ name: 'primary_color', nullable: true, type: 'varchar', length: 7 })
  primaryColor!: string | null;

  @Column({ name: 'logo_url', nullable: true, type: 'varchar' })
  logoUrl!: string | null;

  @Column({ name: 'logo_public_id', nullable: true, type: 'varchar' })
  logoPublicId!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
