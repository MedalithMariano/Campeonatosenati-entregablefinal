import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CloudinaryService } from '../media/cloudinary.service';
import { TournamentTeam } from '../tournaments/entities/tournament-team.entity';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { Team } from './entities/team.entity';

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team)
    private readonly teams: Repository<Team>,
    @InjectRepository(TournamentTeam)
    private readonly registrations: Repository<TournamentTeam>,
    private readonly cloudinary: CloudinaryService,
  ) {}

  findAll(): Promise<Team[]> {
    return this.teams.find({ order: { name: 'ASC' } });
  }

  async findById(id: string): Promise<Team> {
    const team = await this.teams.findOne({ where: { id } });
    if (!team) {
      throw new NotFoundException('Equipo no encontrado');
    }
    return team;
  }

  create(dto: CreateTeamDto): Promise<Team> {
    const team = this.teams.create({
      name: dto.name,
      shortName: dto.shortName ?? null,
      city: dto.city ?? null,
      foundedYear: dto.foundedYear ?? null,
      primaryColor: dto.primaryColor ?? null,
      logoUrl: dto.logoUrl ?? null,
      logoPublicId: dto.logoPublicId ?? null,
    });
    return this.teams.save(team);
  }

  async update(id: string, dto: UpdateTeamDto): Promise<Team> {
    const team = await this.findById(id);

    const replacingLogo =
      dto.logoPublicId !== undefined && dto.logoPublicId !== team.logoPublicId;

    if (replacingLogo && team.logoPublicId) {
      await this.safeDeleteLogo(team.logoPublicId);
    }

    if (dto.name !== undefined) team.name = dto.name;
    if (dto.shortName !== undefined) team.shortName = dto.shortName ?? null;
    if (dto.city !== undefined) team.city = dto.city ?? null;
    if (dto.foundedYear !== undefined)
      team.foundedYear = dto.foundedYear ?? null;
    if (dto.primaryColor !== undefined)
      team.primaryColor = dto.primaryColor ?? null;
    if (dto.logoUrl !== undefined) team.logoUrl = dto.logoUrl ?? null;
    if (dto.logoPublicId !== undefined)
      team.logoPublicId = dto.logoPublicId ?? null;

    return this.teams.save(team);
  }

  async remove(id: string): Promise<void> {
    const team = await this.findById(id);

    const registered = await this.registrations.count({
      where: { teamId: id },
    });
    if (registered > 0) {
      throw new ConflictException(
        'No se puede eliminar el equipo porque está inscrito en uno o más torneos',
      );
    }

    if (team.logoPublicId) {
      await this.safeDeleteLogo(team.logoPublicId);
    }
    await this.teams.delete(id);
  }

  private async safeDeleteLogo(publicId: string): Promise<void> {
    try {
      await this.cloudinary.deleteImage(publicId);
    } catch {
      // No bloquear la operación si Cloudinary falla — el archivo huérfano se limpia luego.
    }
  }
}
