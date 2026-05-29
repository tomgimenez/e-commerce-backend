import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { S3Client, DeleteObjectCommand, DeleteObjectsCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { S3Service } from './s3.service';

jest.mock('@aws-sdk/client-s3', () => {
  const actual = jest.requireActual('@aws-sdk/client-s3');
  return {
    ...actual,
    S3Client: jest.fn().mockImplementation(() => ({
      send: jest.fn(),
    })),
  };
});

jest.mock('@aws-sdk/lib-storage', () => ({
  Upload: jest.fn().mockImplementation(() => ({
    done: jest.fn().mockResolvedValue({}),
  })),
}));

jest.mock('fs', () => ({
  createReadStream: jest.fn().mockReturnValue('mock-stream'),
}));

jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('mock-uuid'),
}));

// --- Helpers ---

const mockConfigService = {
  getOrThrow: jest.fn((key: string) => {
    const config: Record<string, string> = {
      AWS_REGION: 'us-east-1',
      AWS_ACCESS_KEY_ID: 'fake-key-id',
      AWS_SECRET_ACCESS_KEY: 'fake-secret',
      AWS_S3_BUCKET: 'my-test-bucket',
    };
    if (!(key in config)) throw new Error(`Missing config key: ${key}`);
    return config[key];
  }),
  get: jest.fn((key: string) => {
    const config: Record<string, string> = {
      AWS_REGION: 'us-east-1',
    };
    return config[key];
  }),
};


describe('S3Service', () => {
  let service: S3Service;
  let s3ClientInstance: { send: jest.Mock };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        S3Service,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<S3Service>(S3Service);
    // Grab the mocked instance that was created inside the constructor
    s3ClientInstance = (S3Client as jest.Mock).mock.results[0].value;
  });

  describe('constructor', () => {
    it('should instantiate S3Client with values from ConfigService', () => {
      expect(S3Client).toHaveBeenCalledWith({
        region: 'us-east-1',
        credentials: {
          accessKeyId: 'fake-key-id',
          secretAccessKey: 'fake-secret',
        },
      });
    });
  });

  describe('uploadBuffer', () => {
    const buffer = Buffer.from('image-data');

    it('should upload and return fileName and secureUrl', async () => {
      const result = await service.uploadBuffer(buffer, 'photo.jpg');

      expect(Upload).toHaveBeenCalledWith(
        expect.objectContaining({
          params: expect.objectContaining({
            Bucket: 'my-test-bucket',
            Key: 'products/mock-uuid.jpg',
            Body: buffer,
            ContentType: 'image/jpeg',
          }),
        }),
      );

      expect(result).toEqual({
        fileName: 'products/mock-uuid.jpg',
        secureUrl: 'https://my-test-bucket.s3.us-east-1.amazonaws.com/products/mock-uuid.jpg',
      });
    });

    it('should use the custom folder when provided', async () => {
      await service.uploadBuffer(buffer, 'photo.png', 'avatars');

      expect(Upload).toHaveBeenCalledWith(
        expect.objectContaining({
          params: expect.objectContaining({
            Key: 'avatars/mock-uuid.png',
            ContentType: 'image/png',
          }),
        }),
      );
    });

    it('should fall back to application/octet-stream for unknown extensions', async () => {
      await service.uploadBuffer(buffer, 'file.xyz');

      expect(Upload).toHaveBeenCalledWith(
        expect.objectContaining({
          params: expect.objectContaining({
            ContentType: 'application/octet-stream',
          }),
        }),
      );
    });

    it('should propagate errors from Upload.done()', async () => {
      (Upload as unknown as jest.Mock).mockImplementationOnce(() => ({
        done: jest.fn().mockRejectedValue(new Error('Upload failed')),
      }));

      await expect(service.uploadBuffer(buffer, 'photo.jpg')).rejects.toThrow('Upload failed');
    });
  });

  describe('uploadFromPath', () => {
    it('should upload from a local path and return the S3 key', async () => {
      const key = await service.uploadFromPath('/tmp/seed/image.webp');

      expect(Upload).toHaveBeenCalledWith(
        expect.objectContaining({
          params: expect.objectContaining({
            Bucket: 'my-test-bucket',
            Key: 'products/mock-uuid.webp',
            Body: 'mock-stream',
            ContentType: 'image/webp',
          }),
        }),
      );

      expect(key).toBe('products/mock-uuid.webp');
    });

    it('should use the custom folder when provided', async () => {
      const key = await service.uploadFromPath('/tmp/seed/img.png', 'banners');

      expect(key).toBe('banners/mock-uuid.png');
    });
  });

  describe('deleteByKey', () => {
    it('should send a DeleteObjectCommand with the correct params', async () => {
      s3ClientInstance.send.mockResolvedValue({});

      await service.deleteByKey('products/some-image.jpg');

      expect(s3ClientInstance.send).toHaveBeenCalledTimes(1);
      const command = s3ClientInstance.send.mock.calls[0][0];
      expect(command).toBeInstanceOf(DeleteObjectCommand);
      expect(command.input).toEqual({
        Bucket: 'my-test-bucket',
        Key: 'products/some-image.jpg',
      });
    });

    it('should propagate errors from the S3 client', async () => {
      s3ClientInstance.send.mockRejectedValue(new Error('Delete failed'));

      await expect(service.deleteByKey('products/img.jpg')).rejects.toThrow('Delete failed');
    });
  });

  describe('emptyBucket', () => {
    it('should do nothing when the bucket is already empty', async () => {
      s3ClientInstance.send.mockResolvedValueOnce({
        Contents: [],
        IsTruncated: false,
      });

      await service.emptyBucket();

      // Only the list call, no delete call
      expect(s3ClientInstance.send).toHaveBeenCalledTimes(1);
      expect(s3ClientInstance.send.mock.calls[0][0]).toBeInstanceOf(ListObjectsV2Command);
    });

    it('should delete all objects in a single page', async () => {
      s3ClientInstance.send
        .mockResolvedValueOnce({
          Contents: [{ Key: 'products/a.jpg' }, { Key: 'products/b.png' }],
          IsTruncated: false,
        })
        .mockResolvedValueOnce({}); // DeleteObjectsCommand response

      await service.emptyBucket();

      expect(s3ClientInstance.send).toHaveBeenCalledTimes(2);

      const deleteCommand = s3ClientInstance.send.mock.calls[1][0];
      expect(deleteCommand).toBeInstanceOf(DeleteObjectsCommand);
      expect(deleteCommand.input).toEqual({
        Bucket: 'my-test-bucket',
        Delete: {
          Objects: [{ Key: 'products/a.jpg' }, { Key: 'products/b.png' }],
          Quiet: true,
        },
      });
    });

    it('should paginate when IsTruncated is true', async () => {
      s3ClientInstance.send
        // Page 1 — list
        .mockResolvedValueOnce({
          Contents: [{ Key: 'products/page1.jpg' }],
          IsTruncated: true,
          NextContinuationToken: 'token-123',
        })
        // Page 1 — delete
        .mockResolvedValueOnce({})
        // Page 2 — list
        .mockResolvedValueOnce({
          Contents: [{ Key: 'products/page2.jpg' }],
          IsTruncated: false,
        })
        // Page 2 — delete
        .mockResolvedValueOnce({});

      await service.emptyBucket();

      expect(s3ClientInstance.send).toHaveBeenCalledTimes(4);

      // Second list call should carry the continuation token
      const secondListCommand = s3ClientInstance.send.mock.calls[2][0];
      expect(secondListCommand).toBeInstanceOf(ListObjectsV2Command);
      expect(secondListCommand.input.ContinuationToken).toBe('token-123');
    });

    it('should skip delete when Contents is undefined', async () => {
      s3ClientInstance.send.mockResolvedValueOnce({
        Contents: undefined,
        IsTruncated: false,
      });

      await service.emptyBucket();

      expect(s3ClientInstance.send).toHaveBeenCalledTimes(1);
    });
  });

  describe('buildUrl', () => {
    it('should build the correct public URL for a key', () => {
      const url = service.buildUrl('products/mock-uuid.jpg');

      expect(url).toBe(
        'https://my-test-bucket.s3.us-east-1.amazonaws.com/products/mock-uuid.jpg',
      );
    });
  });
});