import { CssColorParser } from 'src/CssColorParser';

describe('CSS Color Parser', () => {
  let parser: CssColorParser;

  beforeAll(() => {
    parser = new CssColorParser();
  });

  describe('should return correct RGB number representation', () => {
    test('for simple HWB color', () => {
      const hwbColor = 'hwb(100deg 50% 40%)';
      const color = parser.parse(hwbColor);

      expect(color.toHexNumberString()).toBe('0xFF889980');
    });

    test('for HWB color with alpha', () => {
      const hwbColor = 'hwb(100deg 50% 40% / 0.23)';
      const color = parser.parse(hwbColor);

      expect(color.toHexNumberString()).toBe('0x3B889980');
    });

    test('for HWB color with percentage alpha', () => {
      const hwbColor = 'hwb(100deg 50% 40% / 23%)';
      const color = parser.parse(hwbColor);

      expect(color.toHexNumberString()).toBe('0x3B889980');
    });

    test('for simple HWB color in legacy format', () => {
      const hwbColor = 'hwb(100deg, 50%, 40%)';
      const color = parser.parse(hwbColor);

      expect(color.toHexNumberString()).toBe('0xFF889980');
    });

    test('for HWB color with percentage alpha in legacy format', () => {
      const hwbColor = 'hwb(100deg, 50%, 40%, 23%)';
      const color = parser.parse(hwbColor);

      expect(color.toHexNumberString()).toBe('0x3B889980');
    });

    test('for HWB color with alpha in mixed color format (invalid by specification, but required by task)', () => {
      const hwbColor = 'hwb(100deg, 50%, 40% / 0.23)';
      const color = parser.parse(hwbColor);

      expect(color.toHexNumberString()).toBe('0x3B889980');
    });

    test('for HWB color with percentage alpha in mixed color format (invalid by specification, but required by task)', () => {
      const hwbColor = 'hwb(100deg, 50%, 40% / 23%)';
      const color = parser.parse(hwbColor);

      expect(color.toHexNumberString()).toBe('0x3B889980');
    });

    test('for HWB color with alias function name', () => {
      const hwbColor = 'hwba(100deg 50% 40% / 23%)';
      const color = parser.parse(hwbColor);

      expect(color.toHexNumberString()).toBe('0x3B889980');
    });

    test('for HWB color with none as hue value', () => {
      const hwbColor = 'hwb(none 50% 40% / 23%)';
      const color = parser.parse(hwbColor);

      expect(color.toHexNumberString()).toBe('0x3B998080');
    });

    test('for HWB color with none as saturation value', () => {
      const hwbColor = 'hwb(100deg none 40% / 23%)';
      const color = parser.parse(hwbColor);

      expect(color.toHexNumberString()).toBe('0x3B339900');
    });

    test('for HWB color with none as lightness value', () => {
      const hwbColor = 'hwb(100deg 50% none / 23%)';
      const color = parser.parse(hwbColor);

      expect(color.toHexNumberString()).toBe('0x3BAAFF80');
    });

    test('for HWB color with none as alpha value', () => {
      const hwbColor = 'hwb(100deg 50% 40% / none)';
      const color = parser.parse(hwbColor);

      expect(color.toHexNumberString()).toBe('0x00889980');
    });

    test('for HWB color with none as values', () => {
      const hwbColor = 'hwb(none none none / none)';
      const color = parser.parse(hwbColor);

      expect(color.toHexNumberString()).toBe('0x00FF0000');
    });

    test('for HWB color with hue in degrees', () => {
      const hwbColor = 'hwb(100deg 50% 40% / 23%)';
      const color = parser.parse(hwbColor);

      expect(color.toHexNumberString()).toBe('0x3B889980');
    });

    test('for HWB color with hue in gradians', () => {
      const hwbColor = 'hwb(100grad 50% 40% / 23%)';
      const color = parser.parse(hwbColor);

      expect(color.toHexNumberString()).toBe('0x3B8C9980');
    });

    test('for HWB color with hue in radians', () => {
      const hwbColor = 'hwb(100rad 50% 40% / 23%)';
      const color = parser.parse(hwbColor);

      expect(color.toHexNumberString()).toBe('0x3B99808C');
    });

    test('for HWB color with hue in turns', () => {
      const hwbColor = 'hwb(1.3turn 50% 40% / 23%)';
      const color = parser.parse(hwbColor);

      expect(color.toHexNumberString()).toBe('0x3B859980');
    });

    test('for HWB color with arguments without unit type', () => {
      const hwbColor = 'hwb(100 50 40 / 23%)';
      const color = parser.parse(hwbColor);

      expect(color.toHexNumberString()).toBe('0x3B889980');
    });
  });

  describe('should throw an error when HWB color is invalid', () => {
    const invalidColors = [
      'hwb(100 40, 50 / 23%)',
      'hwb(100, 40, 50, 23%, 30)',
      'hwb(100, 40)',
      'hwb(100 40 50 / 23%',
      'hwb(100 40 50 23%)',
    ];

    for (const invalidColor of invalidColors) {
      const testFunc = (color: string) => () => parser.parse(color);

      test(invalidColor, () => {
        expect(testFunc(invalidColor)).toThrow();
      });
    }
  });
});
