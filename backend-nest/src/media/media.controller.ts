import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { IsIn, IsString } from 'class-validator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../users/enums/user-role.enum';
import { CloudinaryService } from './cloudinary.service';
import { ImageProcessorService } from './image-processor.service';

const ALLOWED_SUBFOLDERS = ['teams', 'players', 'tournaments'] as const;
type AllowedSubfolder = (typeof ALLOWED_SUBFOLDERS)[number];

export class UploadImageDto {
  @IsString()
  @IsIn(ALLOWED_SUBFOLDERS as unknown as string[], {
    message: 'Carpeta destino no permitida',
  })
  folder!: AllowedSubfolder;
}

@Controller('uploads')
export class MediaController {
  constructor(
    private readonly cloudinary: CloudinaryService,
    private readonly processor: ImageProcessorService,
    private readonly config: ConfigService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body() body: UploadImageDto,
  ) {
    if (!file) {
      throw new BadRequestException('Falta el archivo (campo "file")');
    }

    const maxBytes = Number(this.config.get<string>('UPLOAD_MAX_BYTES')) || 0;
    if (maxBytes > 0 && file.size > maxBytes) {
      throw new BadRequestException(
        `El archivo excede el tamaño máximo (${maxBytes} bytes)`,
      );
    }

    const normalized = await this.processor.process(file.buffer);
    return this.cloudinary.uploadImage(normalized, body.folder);
  }
}
