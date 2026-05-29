import { fileFilter } from "./file-filter.helper";

// ─── Helpers ────────────────────────────────────────────────────────────────


function buildFile(mimetype: string): Express.Multer.File {
  return { mimetype } as Express.Multer.File;
}

const mockReq = {} as Express.Request;

describe('fileFilter', () => {

  it('should call callback with an error when file is falsy', () => {
    const cb = jest.fn();

    fileFilter(mockReq, null as any, cb);

    expect(cb).toHaveBeenCalledWith(new Error('File is empty'), false);
  });

  it.each(['image/jpg', 'image/jpeg', 'image/png', 'image/gif'])(
    'should accept %s',
    (mimetype) => {
      const cb = jest.fn();

      fileFilter(mockReq, buildFile(mimetype), cb);

      expect(cb).toHaveBeenCalledWith(null, true);
    },
  );

  it.each(['image/webp', 'image/svg+xml', 'application/pdf', 'video/mp4'])(
    'should reject %s',
    (mimetype) => {
      const cb = jest.fn();

      fileFilter(mockReq, buildFile(mimetype), cb);

      expect(cb).toHaveBeenCalledWith(null, false);
    },
  );
});