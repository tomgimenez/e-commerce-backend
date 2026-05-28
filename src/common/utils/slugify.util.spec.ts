import { slugify } from './slugify.util';

describe('slugify', () => {
  it('should convert to lowercase', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('should replace spaces with hyphens', () => {
    expect(slugify('hello world')).toBe('hello-world');
  });

  it('should remove accents', () => {
    expect(slugify('café résumé')).toBe('cafe-resume');
  });

  it('should remove special characters', () => {
    expect(slugify('hello! world@#')).toBe('hello-world');
  });

  it('should collapse multiple spaces into one hyphen', () => {
    expect(slugify('hello   world')).toBe('hello-world');
  });

  it('should collapse multiple hyphens into one', () => {
    expect(slugify('hello--world')).toBe('hello-world');
  });

  it('should trim leading and trailing spaces', () => {
    expect(slugify('  hello world  ')).toBe('hello-world');
  });

  it('should handle spanish characters', () => {
    expect(slugify('Ñoño y güisqui')).toBe('nono-y-guisqui');
  });

  it('should return empty string for empty input', () => {
    expect(slugify('')).toBe('');
  });

  it('should handle already valid slugs', () => {
    expect(slugify('hello-world')).toBe('hello-world');
  });
});