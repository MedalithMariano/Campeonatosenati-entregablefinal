import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { CloudinaryService } from '../media/cloudinary.service';
import { TournamentRoster } from '../tournaments/entities/tournament-roster.entity';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';
import { Player } from './entities/player.entity';

@Injectable()
export class PlayersService {
  constructor(
    @InjectRepository(Player)
    private readonly players: Repository<Player>,
    @InjectRepository(TournamentRoster)
    private readonly rosters: Repository<TournamentRoster>,
    private readonly cloudinary: CloudinaryService,
  ) {}

  findAll(): Promise<Player[]> {
    return this.players.find({
      order: { lastName: 'ASC', firstName: 'ASC' },
    });
  }

  async findById(id: string): Promise<Player> {
    const player = await this.players.findOne({ where: { id } });
    if (!player) {
      throw new NotFoundException('Jugador no encontrado');
    }
    return player;
  }

  async create(dto: CreatePlayerDto): Promise<Player> {
    await this.assertDocumentUnique(dto.documentType, dto.documentNumber);

    const player = this.players.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      documentType: dto.documentType,
      documentNumber: dto.documentNumber,
      birthDate: dto.birthDate,
      position: dto.position,
      preferredFoot: dto.preferredFoot ?? null,
      nationality: dto.nationality ?? null,
      photoUrl: dto.photoUrl ?? null,
      photoPublicId: dto.photoPublicId ?? null,
    });
    return this.players.save(player);
  }

  async update(id: string, dto: UpdatePlayerDto): Promise<Player> {
    const player = await this.findById(id);

    if (
      (dto.documentType !== undefined &&
        dto.documentType !== player.documentType) ||
      (dto.documentNumber !== undefined &&
        dto.documentNumber !== player.documentNumber)
    ) {
      await this.assertDocumentUnique(
        dto.documentType ?? player.documentType,
        dto.documentNumber ?? player.documentNumber,
        id,
      );
    }

    const replacingPhoto =
      dto.photoPublicId !== undefined &&
      dto.photoPublicId !== player.photoPublicId;

    if (replacingPhoto && player.photoPublicId) {
      await this.safeDeletePhoto(player.photoPublicId);
    }

    if (dto.firstName !== undefined) player.firstName = dto.firstName;
    if (dto.lastName !== undefined) player.lastName = dto.lastName;
    if (dto.documentType !== undefined) player.documentType = dto.documentType;
    if (dto.documentNumber !== undefined)
      player.documentNumber = dto.documentNumber;
    if (dto.birthDate !== undefined) player.birthDate = dto.birthDate;
    if (dto.position !== undefined) player.position = dto.position;
    if (dto.preferredFoot !== undefined)
      player.preferredFoot = dto.preferredFoot ?? null;
    if (dto.nationality !== undefined)
      player.nationality = dto.nationality ?? null;
    if (dto.photoUrl !== undefined) player.photoUrl = dto.photoUrl ?? null;
    if (dto.photoPublicId !== undefined)
      player.photoPublicId = dto.photoPublicId ?? null;

    return this.players.save(player);
  }

  async remove(id: string): Promise<void> {
    const player = await this.findById(id);

    const rostered = await this.rosters.count({ where: { playerId: id } });
    if (rostered > 0) {
      throw new ConflictException(
        'No se puede eliminar el jugador porque está en el roster de uno o más torneos',
      );
    }

    if (player.photoPublicId) {
      await this.safeDeletePhoto(player.photoPublicId);
    }
    await this.players.delete(id);
  }

  private async assertDocumentUnique(
    documentType: Player['documentType'],
    documentNumber: string,
    excludeId?: string,
  ): Promise<void> {
    const conflict = await this.players.findOne({
      where: {
        documentType,
        documentNumber,
        ...(excludeId ? { id: Not(excludeId) } : {}),
      },
    });
    if (conflict) {
      throw new ConflictException(
        'Ya existe un jugador con ese documento',
      );
    }
  }

  private async safeDeletePhoto(publicId: string): Promise<void> {
    try {
      await this.cloudinary.deleteImage(publicId);
    } catch {
      // No bloquear si Cloudinary falla — el archivo huérfano se limpia luego.
    }
  }
}
