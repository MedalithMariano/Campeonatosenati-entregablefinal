import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DocumentType } from '../../profiles/enums/document-type.enum';
import { PlayerPosition } from '../enums/player-position.enum';
import { PreferredFoot } from '../enums/preferred-foot.enum';

@Entity({ name: 'players' })
@Index('UQ_player_document', ['documentType', 'documentNumber'], {
  unique: true,
})
export class Player {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'first_name' })
  firstName!: string;

  @Column({ name: 'last_name' })
  lastName!: string;

  @Column({
    name: 'document_type',
    type: 'enum',
    enum: DocumentType,
  })
  documentType!: DocumentType;

  @Column({ name: 'document_number' })
  documentNumber!: string;

  @Column({ name: 'birth_date', type: 'date' })
  birthDate!: string;

  @Column({ type: 'enum', enum: PlayerPosition })
  position!: PlayerPosition;

  @Column({
    name: 'preferred_foot',
    type: 'enum',
    enum: PreferredFoot,
    nullable: true,
  })
  preferredFoot!: PreferredFoot | null;

  @Column({ nullable: true, type: 'varchar', length: 60 })
  nationality!: string | null;

  @Column({ name: 'photo_url', nullable: true, type: 'varchar' })
  photoUrl!: string | null;

  @Column({ name: 'photo_public_id', nullable: true, type: 'varchar' })
  photoPublicId!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
