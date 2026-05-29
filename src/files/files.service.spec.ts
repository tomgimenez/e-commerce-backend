import { BadRequestException } from '@nestjs/common';
import { join } from 'path';
import { existsSync } from 'fs';

import { FilesService } from './files.service';

// ─── Mocks ──────────────────────────────────────────────────────────────────

jest.mock('fs', () => ({
  existsSync: jest.fn(),
}));

describe('FilesService', () => {
  let service: FilesService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new FilesService();
  });

  describe('getStaticProductImage', () => {

    it('should return the full path when the file exists', () => {
      (existsSync as jest.Mock).mockReturnValue(true);

      const result = service.getStaticProductImage('shirt.jpg');
      const expectedPath = join(__dirname, '../../static/products', 'shirt.jpg');

      expect(result).toBe(expectedPath);
    });

    it('should call existsSync with the correct path', () => {
      (existsSync as jest.Mock).mockReturnValue(true);

      service.getStaticProductImage('shirt.jpg');
      const expectedPath = join(__dirname, '../../static/products', 'shirt.jpg');

      expect(existsSync).toHaveBeenCalledWith(expectedPath);
    });

    it('should throw BadRequestException when the file does not exist', () => {
      (existsSync as jest.Mock).mockReturnValue(false);

      expect(() => service.getStaticProductImage('ghost.jpg')).toThrow(BadRequestException);
    });

    it('should include the image name in the error message', () => {
      (existsSync as jest.Mock).mockReturnValue(false);

      expect(() => service.getStaticProductImage('ghost.jpg')).toThrow(
        'No product found with image ghost.jpg',
      );
    });
  });
});