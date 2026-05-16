import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CloudinaryService } from '../media/cloudinary.service';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { UpdateTournamentDto } from './dto/update-tournament.dto';
import { Tournament } from './entities/tournament.entity';

@Injectable()
export class TournamentsService {
  constructor(
    @InjectRepository(Tournament)
    private readonly tournaments: Repository<Tournament>,
    private readonly cloudinary: CloudinaryService,
  ) {}

  findAll(): Promise<Tournament[]> {
    return this.tournaments.find({
      order: { season: 'DESC', name: 'ASC' },
    });
  }

  async findById(id: string): Promise<Tournament> {
    const tournament = await this.tournaments.findOne({ where: { id } });
    if (!tournament) {
      throw new NotFoundException('Torneo no encontrado');
    }
    return tournament;
  }

  async create(dto: CreateTournamentDto): Promise<Tournament> {
    this.assertRosterRange(
      dto.minPlayersPerRoster,
      dto.maxPlayersPerRoster,
    );
    this.assertDateRange(dto.startDate, dto.endDate);

    const tournament = this.tournaments.create({
      name: dto.name,
      season: dto.season,
      format: dto.format,
      status: dto.status,
      pointsWin: dto.pointsWin,
      pointsDraw: dto.pointsDraw,
      pointsLoss: dto.pointsLoss,
      minPlayersPerRoster: dto.minPlayersPerRoster,
      maxPlayersPerRoster: dto.maxPlayersPerRoster,
      startDate: dto.startDate ?? null,
      endDate: dto.endDate ?? null,
      description: dto.description ?? null,
      bannerUrl: dto.bannerUrl ?? null,
      bannerPublicId: dto.bannerPublicId ?? null,
    });
    return this.tournaments.save(tournament);
  }

  async update(id: string, dto: UpdateTournamentDto): Promise<Tournament> {
    const tournament = await this.findById(id);

    const nextMin = dto.minPlayersPerRoster ?? tournament.minPlayersPerRoster;
    const nextMax = dto.maxPlayersPerRoster ?? tournament.maxPlayersPerRoster;
    this.assertRosterRange(nextMin, nextMax);

    this.assertDateRange(
      dto.startDate ?? tournament.startDate ?? undefined,
      dto.endDate ?? tournament.endDate ?? undefined,
    );

    const replacingBanner =
      dto.bannerPublicId !== undefined &&
      dto.bannerPublicId !== tournament.bannerPublicId;
    if (replacingBanner && tournament.bannerPublicId) {
      await this.safeDeleteBanner(tournament.bannerPublicId);
    }

    if (dto.name !== undefined) tournament.name = dto.name;
    if (dto.season !== undefined) tournament.season = dto.season;
    if (dto.format !== undefined) tournament.format = dto.format;
    if (dto.status !== undefined) tournament.status = dto.status;
    if (dto.pointsWin !== undefined) tournament.pointsWin = dto.pointsWin;
    if (dto.pointsDraw !== undefined) tournament.pointsDraw = dto.pointsDraw;
    if (dto.pointsLoss !== undefined) tournament.pointsLoss = dto.pointsLoss;
    if (dto.minPlayersPerRoster !== undefined)
      tournament.minPlayersPerRoster = dto.minPlayersPerRoster;
    if (dto.maxPlayersPerRoster !== undefined)
      tournament.maxPlayersPerRoster = dto.maxPlayersPerRoster;
    if (dto.startDate !== undefined)
      tournament.startDate = dto.startDate ?? null;
    if (dto.endDate !== undefined) tournament.endDate = dto.endDate ?? null;
    if (dto.description !== undefined)
      tournament.description = dto.description ?? null;
    if (dto.bannerUrl !== undefined)
      tournament.bannerUrl = dto.bannerUrl ?? null;
    if (dto.bannerPublicId !== undefined)
      tournament.bannerPublicId = dto.bannerPublicId ?? null;

    return this.tournaments.save(tournament);
  }

  async remove(id: string): Promise<void> {
    const tournament = await this.findById(id);
    if (tournament.bannerPublicId) {
      await this.safeDeleteBanner(tournament.bannerPublicId);
    }
    await this.tournaments.delete(id);
  }

  private assertRosterRange(min?: number, max?: number): void {
    if (min !== undefined && max !== undefined && min > max) {
      throw new BadRequestException(
        'El mínimo de jugadores no puede ser mayor que el máximo',
      );
    }
  }

  private assertDateRange(start?: string, end?: string): void {
    if (start && end && start > end) {
      throw new BadRequestException(
        'La fecha de inicio no puede ser posterior a la de fin',
      );
    }
  }

  private async safeDeleteBanner(publicId: string): Promise<void> {
    try {
      await this.cloudinary.deleteImage(publicId);
    } catch {
      // Cloudinary fail no bloquea la operación
    }
  }
}
