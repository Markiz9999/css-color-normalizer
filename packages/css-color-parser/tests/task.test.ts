import { IColor } from 'src';
import { CssColorParser, IColorParseOptions } from 'src/CssColorParser';
import { ColorParseMode } from 'src/enums/ColorParseMode';

describe('CSS Color Parser', () => {
  let parser: CssColorParser;

  beforeAll(() => {
    parser = new CssColorParser();
  });

  const tests: ([string, string | null] | [string, string | null, IColorParseOptions])[][] = [
    [
      ['deepSkyBlue', '0xFF00BFFF'],
      ['#abcef', null],
      ['#abce', '0xEEAABBCC'],
      ['rgb(12, 34, 56)', '0xFF0C2238'],
      ['hsl(100, 50%, 40%)', '0xFF559933'],
    ],
    [
      ['rgba(123, 45, 67 / 0.5)', '0x807B2D43'],
      ['hsl(54 100% 55% / 60%)', '0x99FFE81A'],
      ['hsla(50deg, 99%, 53%, 60%)', '0x99FED610'],
      ['rgba(123, 45, 67 / 0.5)', '0x807B2D43'],
    ],
    [
      ['oklab(0.92 -0.04 0.19 / 0.6)', '0x99FFE800'],
      ['oklab(1 0 0)', '0xFFFFFFFF'],
      ['hsl(0.3turn 45% 50% / 0.5)', '0x805DB946'],
      ['hsla(0.3turn 45%, 50%, 0.5)', '0x805DB946'],
      ['hsla(0.3turn, 45% 50%, 50%)', null],
    ],
    [
      ['oklab(78% -0.2 -0.1 / 135%)', '0xFF00DBFE'],
      ['color(srgb 1 0.91 0 / 0.6)', '0x99FFE800'],
      ['color(xyz-d65 0.7 0.79 0.12 / 0.6)', '0x99FEE80F'],
      ['light-dark(white, black)', '0xFFFFFFFF', { mode: ColorParseMode.Light }],
      ['light-dark(white, black)', '0xFF000000', { mode: ColorParseMode.Dark }],
    ],
    [
      ['color(from green srgb r g b / 0.5)', '0x80008000'],
      ['color-mix(in lab, plum 60%, #f00 50%)', '0xFFF7707D'],
    ],
  ];

  for (let i = 0; i < tests.length; i++) {
    describe(`level ${i + 1}`, () => {
      for (const [cssColor, expected, options] of tests[i]) {
        test(`${cssColor} => ${expected}`, () => {
          if (expected != null) {
            const color = parser.parse(cssColor, options);
            expect(color.toHexNumberString()).toBe(expected);
          } else {
            const testFunc = (): IColor => parser.parse(cssColor, options);
            expect(testFunc).toThrow();
          }
        });
      }
    });
  }
});
