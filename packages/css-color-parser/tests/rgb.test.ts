import { CssColorParser } from 'src/CssColorParser';

describe('CSS Color Parser', () => {
  let parser: CssColorParser;

  beforeAll(() => {
    parser = new CssColorParser();
  });

  describe('should return correct RGB number representation', () => {
    test('for simple RGB color', () => {
      const rgbColor = 'rgb(100 200 255)';
      const color = parser.parse(rgbColor);

      expect(color.toHexNumberString()).toBe('0xFF64C8FF');
    });

    test('for RGB color with alpha', () => {
      const rgbColor = 'rgb(100 200 255 / 0.23)';
      const color = parser.parse(rgbColor);

      expect(color.toHexNumberString()).toBe('0x3B64C8FF');
    });

    test('for RGB color with percentage alpha', () => {
      const rgbColor = 'rgb(100 200 255 / 23%)';
      const color = parser.parse(rgbColor);

      expect(color.toHexNumberString()).toBe('0x3B64C8FF');
    });

    test('for simple RGB color in legacy format', () => {
      const rgbColor = 'rgb(100, 200, 255)';
      const color = parser.parse(rgbColor);

      expect(color.toHexNumberString()).toBe('0xFF64C8FF');
    });

    test('for RGB color with percentage alpha in legacy format', () => {
      const rgbColor = 'rgb(100, 200, 255, 23%)';
      const color = parser.parse(rgbColor);

      expect(color.toHexNumberString()).toBe('0x3B64C8FF');
    });

    test('for RGB color with alpha in mixed color format (invalid by specification, but required by task)', () => {
      const rgbColor = 'rgb(100, 200, 255 / 0.23)';
      const color = parser.parse(rgbColor);

      expect(color.toHexNumberString()).toBe('0x3B64C8FF');
    });

    test('for RGB color with percentage alpha in mixed color format (invalid by specification, but required by task)', () => {
      const rgbColor = 'rgb(100, 200, 255 / 23%)';
      const color = parser.parse(rgbColor);

      expect(color.toHexNumberString()).toBe('0x3B64C8FF');
    });

    test('for RGB color with percentage parameters', () => {
      const rgbColor = 'rgb(50% 50% 50% / 50%)';
      const color = parser.parse(rgbColor);

      expect(color.toHexNumberString()).toBe('0x80808080');
    });

    test('for RGB color with alias function name', () => {
      const rgbColor = 'rgba(100 200 255 / 0.23)';
      const color = parser.parse(rgbColor);

      expect(color.toHexNumberString()).toBe('0x3B64C8FF');
    });

    test('for RGB color with none as red channel value', () => {
      const rgbColor = 'rgb(none 200 255 / 23%)';
      const color = parser.parse(rgbColor);

      expect(color.toHexNumberString()).toBe('0x3B00C8FF');
    });

    test('for RGB color with none as green channel value', () => {
      const rgbColor = 'rgb(100 none 255 / 23%)';
      const color = parser.parse(rgbColor);

      expect(color.toHexNumberString()).toBe('0x3B6400FF');
    });

    test('for RGB color with none as blue channel value', () => {
      const rgbColor = 'rgb(100 200 none / 23%)';
      const color = parser.parse(rgbColor);

      expect(color.toHexNumberString()).toBe('0x3B64C800');
    });

    test('for RGB color with none as alpha value', () => {
      const rgbColor = 'rgb(100 200 255 / none)';
      const color = parser.parse(rgbColor);

      expect(color.toHexNumberString()).toBe('0x0064C8FF');
    });

    test('for RGB color with none as values', () => {
      const rgbColor = 'rgb(none none none / none)';
      const color = parser.parse(rgbColor);

      expect(color.toHexNumberString()).toBe('0x00000000');
    });
  });

  describe('should parse', () => {
    test('simple RGB color', () => {
      const rgbColor = 'rgb(100 200 255)';
      const color = parser.parse(rgbColor);

      expect(color.A).toBe(255);
      expect(color.R).toBe(100);
      expect(color.G).toBe(200);
      expect(color.B).toBe(255);
    });

    test('for RGB color with alpha', () => {
      const rgbColor = 'rgb(100 200 255 / 0.23)';
      const color = parser.parse(rgbColor);

      expect(color.A).toBe(59);
      expect(color.R).toBe(100);
      expect(color.G).toBe(200);
      expect(color.B).toBe(255);
    });

    test('for RGB color with percentage alpha', () => {
      const rgbColor = 'rgb(100 200 255 / 23%)';
      const color = parser.parse(rgbColor);

      expect(color.A).toBe(59);
      expect(color.R).toBe(100);
      expect(color.G).toBe(200);
      expect(color.B).toBe(255);
    });

    test('for simple RGB color in legacy format', () => {
      const rgbColor = 'rgb(100, 200, 255)';
      const color = parser.parse(rgbColor);

      expect(color.A).toBe(255);
      expect(color.R).toBe(100);
      expect(color.G).toBe(200);
      expect(color.B).toBe(255);
    });

    test('for RGB color with percentage alpha in legacy format', () => {
      const rgbColor = 'rgb(100, 200, 255, 23%)';
      const color = parser.parse(rgbColor);

      expect(color.A).toBe(59);
      expect(color.R).toBe(100);
      expect(color.G).toBe(200);
      expect(color.B).toBe(255);
    });

    test('for RGB color with alpha in mixed color format (invalid by specification, but required by task)', () => {
      const rgbColor = 'rgb(100, 200, 255 / 0.23)';
      const color = parser.parse(rgbColor);

      expect(color.A).toBe(59);
      expect(color.R).toBe(100);
      expect(color.G).toBe(200);
      expect(color.B).toBe(255);
    });

    test('for RGB color with percentage alpha in mixed color format (invalid by specification, but required by task)', () => {
      const rgbColor = 'rgb(100, 200, 255 / 23%)';
      const color = parser.parse(rgbColor);

      expect(color.A).toBe(59);
      expect(color.R).toBe(100);
      expect(color.G).toBe(200);
      expect(color.B).toBe(255);
    });
  });

  describe('should throw an error when RGB color is invalid', () => {
    const invalidColors = [
      'rgb(100 200, 255 / 23%)',
      'rgb(100, 200, 255, 23%, 100)',
      'rgb(100, 200)',
      'rgb(100 200 255 / 23%',
      'rgb(100 200 255 23%)',
    ];

    for (const invalidColor of invalidColors) {
      const testFunc = (color: string) => () => parser.parse(color);

      test(invalidColor, () => {
        expect(testFunc(invalidColor)).toThrow();
      });
    }
  });
});
