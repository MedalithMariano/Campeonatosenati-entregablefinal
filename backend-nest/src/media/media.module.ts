import { Module } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { ImageProcessorService } from './image-processor.service';
import { MediaController } from './media.controller';

@Module({
  providers: [CloudinaryService, ImageProcessorService],
  controllers: [MediaController],
  exports: [CloudinaryService, ImageProcessorService],
})
export class MediaModule {}
