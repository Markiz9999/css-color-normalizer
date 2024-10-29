import { CssColorParser } from 'src/CssColorParser';

describe('CSS Color Parser', () => {
  let parser: CssColorParser;

  beforeAll(() => {
    parser = new CssColorParser();
  });

  describe('should return correct RGB number representation', () => {
    test('for color function with RGB color', () => {
      const cssColor = 'color(srgb 0.1 0.5 0.8 / 40%)';
      const color = parser.parse(cssColor);

      expect(color.toHexNumberString()).toBe('0x661A80CC');
    });

    test('for color function with linear RGB color', () => {
      const cssColor = 'color(srgb-linear 0.1 0.5 0.8 / 40%)';
      const color = parser.parse(cssColor);

      expect(color.toHexNumberString()).toBe('0x6659BCE7');
    });

    test('for color function with display-p3 color', () => {
      const cssColor = 'color(display-p3 0.1 0.5 0.8 / 40%)';
      const color = parser.parse(cssColor);

      expect(color.toHexNumberString()).toBe('0x660082D2');
    });

    test('for color function with a98-rgb color', () => {
      const cssColor = 'color(a98-rgb 0.1 0.5 0.8 / 40%)';
      const color = parser.parse(cssColor);

      expect(color.toHexNumberString()).toBe('0x660081D0');
    });

    test('for color function with prophoto-rgb color', () => {
      const cssColor = 'color(prophoto-rgb 0.1 0.5 0.8 / 40%)';
      const color = parser.parse(cssColor);

      expect(color.toHexNumberString()).toBe('0x66009FDE');
    });

    test('for color function with XYZ color', () => {
      const cssColor = 'color(xyz 0.1 0.5 0.8 / 40%)';
      const color = parser.parse(cssColor);

      expect(color.toHexNumberString()).toBe('0x6600F0E1');
    });

    test('for color function with XYZ D65 color', () => {
      const cssColor = 'color(xyz-d65 0.1 0.5 0.8 / 40%)';
      const color = parser.parse(cssColor);

      expect(color.toHexNumberString()).toBe('0x6600F0E1');
    });

    test('for color function with XYZ D50 color', () => {
      const cssColor = 'color(xyz-d50 0.1 0.5 0.8 / 40%)';
      const color = parser.parse(cssColor);

      expect(color.toHexNumberString()).toBe('0x6600F2FF');
    });

    test('for color function with Rec2020 color', () => {
      const cssColor = 'color(rec2020 0.1 0.5 0.8 / 40%)';
      const color = parser.parse(cssColor);

      expect(color.toHexNumberString()).toBe('0x660092D8');
    });
  });

  describe('should throw an error when color is invalid', () => {
    const invalidColors = [
      'color(srgb 0.1 0.4, 0.6 / 23%)',
      'color(0.1 0.4 0.6 23%)',
      'color(srgb 0.1 0.4 / 23%)',
      'color(srgb 0.1 0.4 0.6 0.5 / 23%)',
      'color(abracadabra 0.1 0.4 0.6 / 23%)',
      'color(srgb 100 40 50 / 23%',
      'color (srgb 100 40 50 / 23%)',
    ];

    for (const invalidColor of invalidColors) {
      const testFunc = (color: string) => () => parser.parse(color);

      test(invalidColor, () => {
        expect(testFunc(invalidColor)).toThrow();
      });
    }
  });
});
