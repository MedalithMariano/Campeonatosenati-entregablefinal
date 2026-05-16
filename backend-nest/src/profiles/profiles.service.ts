import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Profile } from './entities/profile.entity';
import { DocumentType } from './enums/document-type.enum';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
  ) {}

  findByUserId(userId: string): Promise<Profile | null> {
    return this.profileRepository.findOne({ where: { userId } });
  }

  findByDocument(
    documentType: DocumentType,
    documentNumber: string,
  ): Promise<Profile | null> {
    return this.profileRepository.findOne({
      where: { documentType, documentNumber },
    });
  }

  async updateByUserId(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<Profile> {
    const profile = await this.profileRepository.findOne({ where: { userId } });
    if (!profile) {
      throw new NotFoundException('Perfil no encontrado');
    }

    if (dto.firstName !== undefined) profile.firstName = dto.firstName;
    if (dto.lastName !== undefined) profile.lastName = dto.lastName;
    if (dto.phone !== undefined) profile.phone = dto.phone ?? null;
    if (dto.birthDate !== undefined) profile.birthDate = dto.birthDate ?? null;

    return this.profileRepository.save(profile);
  }
}
