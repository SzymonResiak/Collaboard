import { Injectable, BadRequestException } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import * as crypto from 'crypto';
import * as sharp from 'sharp';
import { Attachment } from 'src/common/interfaces/attachment.interface';
import { ConfigService } from '@nestjs/config';
import { Types } from 'mongoose';

@Injectable()
export class FileService {
  private readonly s3: S3;
  private readonly bucket: string;
  private readonly allowedMimeTypes = ['image/jpeg', 'image/png'];
  private readonly maxFileSize = 5 * 1024 * 1024; // 5MB

  constructor(private configService: ConfigService) {
    this.s3 = new S3({
      region: this.configService.get('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
      },
    });
    this.bucket = this.configService.get('AWS_S3_BUCKET');
  }

  async saveFile(
    file: {
      buffer: Buffer;
      originalname: string;
      mimetype: string;
      size: number;
    },
    userId: string,
  ): Promise<Partial<Attachment>> {
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file format.');
    }

    if (file.size > this.maxFileSize) {
      throw new BadRequestException('File is too large.');
    }

    const fileId = crypto.randomUUID();
    let buffer = file.buffer;
    let thumbnailBuffer: Buffer;

    try {
      buffer = await sharp(file.buffer)
        .png({ quality: 80, compressionLevel: 9 })
        .toBuffer();

      thumbnailBuffer = await sharp(file.buffer)
        .resize(200, 200, { fit: 'inside' })
        .png({ quality: 60 })
        .toBuffer();
    } catch (error) {
      throw new BadRequestException('Error processing image');
    }

    const key = `attachments/${fileId}.png`;
    const thumbnailKey = `attachments/thumbnails/${fileId}.png`;

    try {
      await this.s3
        .upload({
          Bucket: this.bucket,
          Key: key,
          Body: buffer,
          ContentType: 'image/png',
          Metadata: {
            originalName: file.originalname,
            userId,
          },
        })
        .promise();

      await this.s3
        .upload({
          Bucket: this.bucket,
          Key: thumbnailKey,
          Body: thumbnailBuffer,
          ContentType: 'image/png',
        })
        .promise();

      return {
        id: fileId,
        filename: file.originalname,
        path: key,
        thumbnailPath: thumbnailKey,
        mimeType: 'image/png',
        size: buffer.length,
        uploadedBy: new Types.ObjectId(userId),
        createdAt: new Date(),
      };
    } catch (error) {
      await this.deleteFile(key).catch(() => {});
      await this.deleteFile(thumbnailKey).catch(() => {});
      throw new BadRequestException('Error saving file.');
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      await this.s3
        .deleteObject({
          Bucket: this.bucket,
          Key: key,
        })
        .promise();
    } catch (error) {
      console.error(`Error deleting file ${key}:`, error);
      throw new BadRequestException('Error deleting file.');
    }
  }

  async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    return this.s3.getSignedUrlPromise('getObject', {
      Bucket: this.bucket,
      Key: key,
      Expires: expiresIn,
    });
  }
}
