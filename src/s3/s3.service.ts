import { DeleteObjectCommand, DeleteObjectsCommand, ListObjectsV2Command, ObjectCannedACL, S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createReadStream } from 'fs';
import { extname } from 'path';
import { v4 as uuid } from 'uuid';

@Injectable()
export class S3Service {
  
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor(private readonly configService: ConfigService) {
    this.client = new S3Client({
      region: configService.getOrThrow('AWS_REGION'),
      credentials: {
        accessKeyId: configService.getOrThrow('AWS_ACCESS_KEY_ID'),
        secretAccessKey: configService.getOrThrow('AWS_SECRET_ACCESS_KEY')
      }
    });
    this.bucket = configService.getOrThrow('AWS_S3_BUCKET');
  }

  // Upload a file from a buffer (comes from an endpoint with Multer)
  async uploadBuffer(
    buffer: Buffer,
    originalName: string,
    folder = 'products'
  ): Promise<object> {
    const ext = extname(originalName);
    const key = `${folder}/${uuid()}${ext}`;

    const upload = new Upload({
      client: this.client,
      params: {
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: this.getMimeType(ext),
      }
    });

    await upload.done();
    
    return {
      fileName: key,
      secureUrl: this.buildUrl(key)
    };
  }

  // Upload a file from local filesystem (seed)
  async uploadFromPath(
    filePath: string,
    folder = 'products'
  ): Promise<string> {
    const ext = extname(filePath);
    const key = `${folder}/${uuid()}${ext}`;
    const stream = createReadStream(filePath);

    const upload = new Upload({
      client: this.client,
      params: {
        Bucket: this.bucket,
        Key: key,
        Body: stream,
        ContentType: this.getMimeType(ext),
      }
    });

    await upload.done();
    return key;
  }

  async deleteByUrl(url: string): Promise<void> {
    const key = this.extractKeyFromUrl(url);
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
    );
  }

  async emptyBucket(): Promise<void> {
  let continuationToken: string | undefined;

  do {
    // Listar hasta 1000 objetos por vez (límite de S3)
    const listResponse = await this.client.send(
      new ListObjectsV2Command({
        Bucket: this.bucket,
        ContinuationToken: continuationToken,
      }),
    );

    const objects = listResponse.Contents;

    if (objects && objects.length > 0) {
      // Borrar todos los del lote en una sola llamada
      await this.client.send(
        new DeleteObjectsCommand({
          Bucket: this.bucket,
          Delete: {
            Objects: objects.map((obj) => ({ Key: obj.Key! })),
            Quiet: true, // no devuelve detalle de cada objeto borrado
          },
        }),
      );
    }

    continuationToken = listResponse.IsTruncated
      ? listResponse.NextContinuationToken
      : undefined;

  } while (continuationToken); // si hay más de 1000 objetos, sigue paginando
}

  buildUrl(key: string): string {
    return `https://${this.bucket}.s3.${this.configService.get('AWS_REGION')}.amazonaws.com/${key}`;
  }

  private extractKeyFromUrl(url: string): string {
    // "https://bucket.s3.region.amazonaws.com/products/abc.jpg"
    //  → "products/abc.jpg"
    const urlObj = new URL(url);
    return urlObj.pathname.slice(1); // quita el "/" inicial
  }

  private getMimeType(ext: string): string {
    const map: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.gif': 'image/gif',
    };
    return map[ext.toLowerCase()] ?? 'application/octet-stream';
  }
}
