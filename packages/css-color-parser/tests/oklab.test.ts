import { CssColorParser } from 'src/CssColorParser';

describe('CSS Color Parser', () => {
  let parser: CssColorParser;

  beforeAll(() => {
    parser = new CssColorParser();
  });

  describe('should return correct RGB number representation', () => {
    test('for simple Oklab color', () => {
      const oklabColor = 'oklab(0.3 0.7 -0.4)';
      const color = parser.parse(oklabColor);

      expect(color.toHexNumberString()).toBe('0xFFC000DD');
    });

    test('for Oklab color with alpha', () => {
      const oklabColor = 'oklab(0.3 0.7 -0.4 / 0.6)';
      const color = parser.parse(oklabColor);

      expect(color.toHexNumberString()).toBe('0x99C000DD');
    });

    test('for Oklab color with percentage alpha', () => {
      const oklabColor = 'oklab(0.3 0.7 -0.4 / 60%)';
      const color = parser.parse(oklabColor);

      expect(color.toHexNumberString()).toBe('0x99C000DD');
    });

    test('for Oklab color with none as lightness value', () => {
      const oklabColor = 'oklab(none 0.7 0.4 / 60%)';
      const color = parser.parse(oklabColor);

      expect(color.toHexNumberString()).toBe('0x99000000');
    });

    test('for Oklab color with none as a-axis value', () => {
      const oklabColor = 'oklab(0.3 none 0.4 / 60%)';
      const color = parser.parse(oklabColor);

      expect(color.toHexNumberString()).toBe('0x99710000');
    });

    test('for Oklab color with none as b-axis value', () => {
      const oklabColor = 'oklab(0.3 0.7 none / 60%)';
      const color = parser.parse(oklabColor);

      expect(color.toHexNumberString()).toBe('0x99E1001F');
    });

    test('for Oklab color with none as alpha value', () => {
      const oklabColor = 'oklab(0.3 0.7 0.4 / none)';
      const color = parser.parse(oklabColor);

      expect(color.toHexNumberString()).toBe('0x00FF0000');
    });

    test('for Oklab color with none as values', () => {
      const oklabColor = 'oklab(none none none / none)';
      const color = parser.parse(oklabColor);

      expect(color.toHexNumberString()).toBe('0x00000000');
    });
  });

  describe('should throw an error when Oklab color is invalid', () => {
    const invalidColors = [
      'oklab(1 0.4, 0.1 / 23%)',
      'oklab(1 0.4 0.1 0.1)',
      'oklab(1 0.4)',
      'oklab(1 0.4 0.1 / 23%',
      'oklab(1 0.4 0.1 23%)',
    ];

    for (const invalidColor of invalidColors) {
      const testFunc = (color: string) => () => parser.parse(color);

      test(invalidColor, () => {
        expect(testFunc(invalidColor)).toThrow();
      });
    }
  });
});
