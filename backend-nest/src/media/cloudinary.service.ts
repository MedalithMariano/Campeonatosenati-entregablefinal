import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

export interface UploadedImage {
  url: string;
  publicId: string;
  width: number;
  height: number;
  bytes: number;
  format: string;
}

@Injectable()
export class CloudinaryService implements OnModuleInit {
  private folder!: string;

  constructor(private readonly config: ConfigService) {}

  onModuleInit(): void {
    const cloudName = this.config.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.config.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.config.get<string>('CLOUDINARY_API_SECRET');
    const folder = this.config.get<string>('CLOUDINARY_UPLOAD_FOLDER');

    if (!cloudName || !apiKey || !apiSecret || !folder) {
      throw new Error(
        'Faltan envs de Cloudinary (CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET / UPLOAD_FOLDER)',
      );
    }

    this.folder = folder;
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
  }

  uploadImage(buffer: Buffer, subfolder: string): Promise<UploadedImage> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `${this.folder}/${subfolder}`,
          resource_type: 'image',
          overwrite: false,
          unique_filename: true,
        },
        (error, result?: UploadApiResponse) => {
          if (error) {
            const message =
              (error as { message?: string }).message ?? 'Upload falló';
            const httpCode = (error as { http_code?: number }).http_code;
            return reject(
              new Error(
                `Cloudinary upload error${httpCode ? ` (${httpCode})` : ''}: ${message}`,
              ),
            );
          }
          if (!result) return reject(new Error('Upload sin respuesta'));
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            bytes: result.bytes,
            format: result.format,
          });
        },
      );
      stream.end(buffer);
    });
  }

  async deleteImage(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
  }
}
