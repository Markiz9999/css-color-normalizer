import { CssColorParser } from 'src/CssColorParser';

describe('CSS Color Parser', () => {
  let parser: CssColorParser;

  beforeAll(() => {
    parser = new CssColorParser();
  });

  describe('should return correct RGB number representation', () => {
    test('for color-mix function in RGB color space', () => {
      const cssColor = 'color-mix(in srgb, #dda0dd96, #f005)';
      const color = parser.parse(cssColor);

      expect(color.toHexNumberString()).toBe('0x75E9668D');
    });

    test('for color-mix function in linear RGB color space', () => {
      const cssColor = 'color-mix(in srgb-linear, #dda0dd96, #f005)';
      const color = parser.parse(cssColor);

      expect(color.toHexNumberString()).toBe('0x75EA82B5');
    });

    test('for color-mix function in display-P3 color space', () => {
      const cssColor = 'color-mix(in display-p3, #dda0dd96, #f005)';
      const color = parser.parse(cssColor);

      expect(color.toHexNumberString()).toBe('0x75EB7498');
    });

    test('for color-mix function in A98 RGB color space', () => {
      const cssColor = 'color-mix(in a98-rgb, #dda0dd96, #f005)';
      const color = parser.parse(cssColor);

      expect(color.toHexNumberString()).toBe('0x75EF658E');
    });

    test('for color-mix function in ProPhoto RGB color space', () => {
      const cssColor = 'color-mix(in prophoto-rgb, #dda0dd96, #f005)';
      const color = parser.parse(cssColor);

      expect(color.toHexNumberString()).toBe('0x75EF7BA0');
    });

    test('for color-mix function in Rec2020 color space', () => {
      const cssColor = 'color-mix(in rec2020, #dda0dd96, #f005)';
      const color = parser.parse(cssColor);

      expect(color.toHexNumberString()).toBe('0x75EE789A');
    });

    test('for color-mix function in Lab color space', () => {
      const cssColor = 'color-mix(in lab, #dda0dd96, #f005)';
      const color = parser.parse(cssColor);

      expect(color.toHexNumberString()).toBe('0x75F47B90');
    });

    test('for color-mix function in Oklab color space', () => {
      const cssColor = 'color-mix(in oklab, #dda0dd96, #f005)';
      const color = parser.parse(cssColor);

      expect(color.toHexNumberString()).toBe('0x75ED7F9E');
    });

    test('for color-mix function in XYZ color space', () => {
      const cssColor = 'color-mix(in xyz, #dda0dd96, #f005)';
      const color = parser.parse(cssColor);

      expect(color.toHexNumberString()).toBe('0x75EA82B5');
    });

    test('for color-mix function in XYZ-D65 color space', () => {
      const cssColor = 'color-mix(in xyz-d65, #dda0dd96, #f005)';
      const color = parser.parse(cssColor);

      expect(color.toHexNumberString()).toBe('0x75EA82B5');
    });

    test('for color-mix function in XYZ-D50 color space', () => {
      const cssColor = 'color-mix(in xyz-d50, #dda0dd96, #f005)';
      const color = parser.parse(cssColor);

      expect(color.toHexNumberString()).toBe('0x75EA82B5');
    });

    test('for color-mix function in HSL color space without interpolation method', () => {
      const cssColor = 'color-mix(in hsl, #dda0dd96, #f005)';
      const color = parser.parse(cssColor);

      expect(color.toHexNumberString()).toBe('0x75E26EA8');
    });

    test('for color-mix function in HWB color space', () => {
      const cssColor = 'color-mix(in hwb, #dda0dd96, #f005)';
      const color = parser.parse(cssColor);

      expect(color.toHexNumberString()).toBe('0x75E966A8');
    });

    test('for color-mix function in LCH color space', () => {
      const cssColor = 'color-mix(in lch, #dda0dd96, #f005)';
      const color = parser.parse(cssColor);

      expect(color.toHexNumberString()).toBe('0x75FF6B9F');
    });

    test('for color-mix function in Oklch color space', () => {
      const cssColor = 'color-mix(in oklch, #dda0dd96, #f005)';
      const color = parser.parse(cssColor);

      expect(color.toHexNumberString()).toBe('0x75F576A7');
    });

    test('for color-mix function in HSL color space with shorter interpolation method', () => {
      const cssColor = 'color-mix(in hsl shorter hue, #dda0dd96, #f005)';
      const color = parser.parse(cssColor);

      expect(color.toHexNumberString()).toBe('0x75E26EA8');
    });

    test('for color-mix function in HSL color space with longer interpolation method', () => {
      const cssColor = 'color-mix(in hsl longer hue, #dda0dd96, #f005)';
      const color = parser.parse(cssColor);

      expect(color.toHexNumberString()).toBe('0x756EE2A8');
    });

    test('for color-mix function in HSL color space with increasing interpolation method', () => {
      const cssColor = 'color-mix(in hsl increasing hue, #dda0dd96, #f005)';
      const color = parser.parse(cssColor);

      expect(color.toHexNumberString()).toBe('0x75E26EA8');
    });

    test('for color-mix function in HSL color space with decreasing interpolation method', () => {
      const cssColor = 'color-mix(in hsl decreasing hue, #dda0dd96, #f005)';
      const color = parser.parse(cssColor);

      expect(color.toHexNumberString()).toBe('0x756EE2A8');
    });
  });

  describe('should throw an error when color is invalid', () => {
    const invalidColors = [
      'color-mix(in srgb, blue, red, yellow)',
      'color-mix(blue, red)',
      'color-mix(in abracadabra, blue, red)',
      'color-mix(in srgb, blue, red',
      'color-mix (in srgb, blue, red)',
      'color-mix (in srgb shorter hue, blue, red)',
      'color-mix (in hsl abracadabra hue, blue, red)',
      'color-mix (iin srgb, blue, red)',
      'color-mix (in hsl shorter huee, blue, red)',
    ];

    for (const invalidColor of invalidColors) {
      const testFunc = (color: string) => () => parser.parse(color);

      test(invalidColor, () => {
        expect(testFunc(invalidColor)).toThrow();
      });
    }
  });
});
