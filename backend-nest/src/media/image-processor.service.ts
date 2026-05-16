import { BadRequestException, Injectable } from '@nestjs/common';
import sharp from 'sharp';

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_DIMENSION = 2048;

@Injectable()
export class ImageProcessorService {
  async process(buffer: Buffer): Promise<Buffer> {
    const { fileTypeFromBuffer } = await import('file-type');
    const detected = await fileTypeFromBuffer(buffer);

    if (!detected || !ALLOWED_MIME.has(detected.mime)) {
      throw new BadRequestException(
        'Formato de imagen no permitido (solo JPEG, PNG o WebP)',
      );
    }

    const pipeline = sharp(buffer, { failOn: 'error' }).rotate();
    const metadata = await pipeline.metadata();

    if (
      (metadata.width ?? 0) > MAX_DIMENSION ||
      (metadata.height ?? 0) > MAX_DIMENSION
    ) {
      throw new BadRequestException(
        `La imagen excede las dimensiones permitidas (${MAX_DIMENSION}x${MAX_DIMENSION})`,
      );
    }

    return pipeline
      .resize({
        width: MAX_DIMENSION,
        height: MAX_DIMENSION,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 85 })
      .toBuffer();
  }
}
