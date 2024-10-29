import { CssColorParser } from 'src/CssColorParser';

describe('CSS Color Parser', () => {
  let parser: CssColorParser;

  beforeAll(() => {
    parser = new CssColorParser();
  });

  describe('should return correct RGB number representation', () => {
    test('for simple HSL color', () => {
      const hslColor = 'hsl(100 50% 40%)';
      const color = parser.parse(hslColor);

      expect(color.toHexNumberString()).toBe('0xFF559933');
    });

    test('for HSL color with alpha', () => {
      const hslColor = 'hsl(100 50% 40% / 0.23)';
      const color = parser.parse(hslColor);

      expect(color.toHexNumberString()).toBe('0x3B559933');
    });

    test('for HSL color with percentage alpha', () => {
      const hslColor = 'hsl(100 50% 40% / 23%)';
      const color = parser.parse(hslColor);

      expect(color.toHexNumberString()).toBe('0x3B559933');
    });

    test('for simple HSL color in legacy format', () => {
      const hslColor = 'hsl(100, 50%, 40%)';
      const color = parser.parse(hslColor);

      expect(color.toHexNumberString()).toBe('0xFF559933');
    });

    test('for HSL color with percentage alpha in legacy format', () => {
      const hslColor = 'hsl(100, 50%, 40%, 23%)';
      const color = parser.parse(hslColor);

      expect(color.toHexNumberString()).toBe('0x3B559933');
    });

    test('for HSL color with alpha in mixed color format (invalid by specification, but required by task)', () => {
      const hslColor = 'hsl(100, 50%, 40% / 0.23)';
      const color = parser.parse(hslColor);

      expect(color.toHexNumberString()).toBe('0x3B559933');
    });

    test('for HSL color with percentage alpha in mixed color format (invalid by specification, but required by task)', () => {
      const hslColor = 'hsl(100, 50%, 40% / 23%)';
      const color = parser.parse(hslColor);

      expect(color.toHexNumberString()).toBe('0x3B559933');
    });

    test('for HSL color with alias function name', () => {
      const hslColor = 'hsla(100 50% 40% / 23%)';
      const color = parser.parse(hslColor);

      expect(color.toHexNumberString()).toBe('0x3B559933');
    });

    test('for HSL color with none as hue value', () => {
      const hslColor = 'hsl(none 50% 40% / 23%)';
      const color = parser.parse(hslColor);

      expect(color.toHexNumberString()).toBe('0x3B993333');
    });

    test('for HSL color with none as saturation value', () => {
      const hslColor = 'hsl(100deg none 40% / 23%)';
      const color = parser.parse(hslColor);

      expect(color.toHexNumberString()).toBe('0x3B666666');
    });

    test('for HSL color with none as lightness value', () => {
      const hslColor = 'hsl(100deg 50% none / 23%)';
      const color = parser.parse(hslColor);

      expect(color.toHexNumberString()).toBe('0x3B000000');
    });

    test('for HSL color with none as alpha value', () => {
      const hslColor = 'hsl(100deg 50% 40% / none)';
      const color = parser.parse(hslColor);

      expect(color.toHexNumberString()).toBe('0x00559933');
    });

    test('for HSL color with none as values', () => {
      const hslColor = 'hsl(none none none / none)';
      const color = parser.parse(hslColor);

      expect(color.toHexNumberString()).toBe('0x00000000');
    });

    test('for HSL color with hue in degrees', () => {
      const hslColor = 'hsl(100deg 50% 40% / 23%)';
      const color = parser.parse(hslColor);

      expect(color.toHexNumberString()).toBe('0x3B559933');
    });

    test('for HSL color with hue in gradians', () => {
      const hslColor = 'hsl(100grad 50% 40% / 23%)';
      const color = parser.parse(hslColor);

      expect(color.toHexNumberString()).toBe('0x3B669933');
    });

    test('for HSL color with hue in radians', () => {
      const hslColor = 'hsl(100rad 50% 40% / 23%)';
      const color = parser.parse(hslColor);

      expect(color.toHexNumberString()).toBe('0x3B993367');
    });

    test('for HSL color with hue in turns', () => {
      const hslColor = 'hsl(1.3turn 50% 40% / 23%)';
      const color = parser.parse(hslColor);

      expect(color.toHexNumberString()).toBe('0x3B479933');
    });

    test('for HSL color with arguments without unit type', () => {
      const hslColor = 'hsl(100 50 40 / 23%)';
      const color = parser.parse(hslColor);

      expect(color.toHexNumberString()).toBe('0x3B559933');
    });
  });

  describe('should throw an error when HSL color is invalid', () => {
    const invalidColors = [
      'hsl(100 40, 50 / 23%)',
      'hsl(100, 40, 50, 23%, 30)',
      'hsl(100, 40)',
      'hsl(100 40 50 / 23%',
      'hsl(100 40 50 23%)',
    ];

    for (const invalidColor of invalidColors) {
      const testFunc = (color: string) => () => parser.parse(color);

      test(invalidColor, () => {
        expect(testFunc(invalidColor)).toThrow();
      });
    }
  });
});
