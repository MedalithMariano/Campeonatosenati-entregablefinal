import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePhaseDto } from './dto/create-phase.dto';
import { Phase } from './entities/phase.entity';
import { Tournament } from './entities/tournament.entity';

@Injectable()
export class PhasesService {
  constructor(
    @InjectRepository(Phase)
    private readonly phases: Repository<Phase>,
    @InjectRepository(Tournament)
    private readonly tournaments: Repository<Tournament>,
  ) {}

  findByTournament(tournamentId: string): Promise<Phase[]> {
    return this.phases.find({
      where: { tournamentId },
      order: { order: 'ASC' },
    });
  }

  async create(tournamentId: string, dto: CreatePhaseDto): Promise<Phase> {
    const tournament = await this.tournaments.findOne({
      where: { id: tournamentId },
    });
    if (!tournament) {
      throw new NotFoundException('Torneo no encontrado');
    }

    const conflict = await this.phases.findOne({
      where: { tournamentId, order: dto.order },
    });
    if (conflict) {
      throw new ConflictException(
        `Ya existe una fase con orden ${dto.order} en este torneo`,
      );
    }

    const phase = this.phases.create({
      tournamentId,
      name: dto.name,
      type: dto.type,
      order: dto.order,
      legs: dto.legs ?? 1,
    });
    return this.phases.save(phase);
  }

  async remove(tournamentId: string, phaseId: string): Promise<void> {
    const result = await this.phases.delete({ id: phaseId, tournamentId });
    if (!result.affected) {
      throw new NotFoundException('Fase no encontrada');
    }
  }
}
