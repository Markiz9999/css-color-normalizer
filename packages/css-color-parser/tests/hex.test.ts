import { CssColorParser } from 'src/CssColorParser';

describe('CSS Color Parser', () => {
  let parser: CssColorParser;

  beforeAll(() => {
    parser = new CssColorParser();
  });

  describe('should return correct hex number representation', () => {
    test('for simple hex color', () => {
      const hexColor = '#8F9A1E';
      const color = parser.parse(hexColor);

      expect(color.toHexNumberString()).toBe('0xFF8F9A1E');
    });

    test('for hex color with alpha', () => {
      const hexColor = '#8F9A1E99';
      const color = parser.parse(hexColor);

      expect(color.toHexNumberString()).toBe('0x998F9A1E');
    });

    test('for short hex color', () => {
      const hexColor = '#F71';
      const color = parser.parse(hexColor);

      expect(color.toHexNumberString()).toBe('0xFFFF7711');
    });

    test('for short hex color with alpha', () => {
      const hexColor = '#F718';
      const color = parser.parse(hexColor);

      expect(color.toHexNumberString()).toBe('0x88FF7711');
    });
  });

  describe('should throw an error when hex color is invalid', () => {
    const invalidColors = ['#', '#1', '#F1', '#F1981', '#X14597', '#1X4597', '#1234567', '#123456789', '#1234567P'];

    for (const invalidColor of invalidColors) {
      const testFunc = (color: string) => () => parser.parse(color);

      test(invalidColor, () => {
        expect(testFunc(invalidColor)).toThrow();
      });
    }
  });
});
