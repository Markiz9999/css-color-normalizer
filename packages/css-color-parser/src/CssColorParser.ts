import { IColor } from './interfaces/IColor';
import { IColorParser } from './interfaces/IColorParser';
import { ILightDarkColorParseOptions } from './interfaces/ILightDarkColorParseOptions';
import { ColorFuncColorParser } from './parsers/ColorFuncColorParser';
import { ConstantColorParser } from './parsers/ConstantColorParser';
import { HexColorParser } from './parsers/HexColorParser';
import { HslColorParser } from './parsers/HslColorParser';
import { HwbColorParser } from './parsers/HwbColorParser';
import { LightDarkColorParser } from './parsers/LightDarkColorParser';
import { OklabColorParser } from './parsers/OklabColorParser';
import { RgbColorParser } from './parsers/RgbColorParser';

export type IColorParseOptions = ILightDarkColorParseOptions;

type ParseBuilder<Options = unknown> = (
  options?: IColorParseOptions,
) => IColorParser<Options> | [IColorParser<Options>] | [IColorParser<Options>, Options];

export class CssColorParser implements IColorParser<IColorParseOptions> {
  protected parserBuilders: ParseBuilder[];

  public constructor() {
    this.parserBuilders = [
      () => new ConstantColorParser(),
      () => new HexColorParser(),
      () => new RgbColorParser(),
      () => new HslColorParser(),
      () => new HwbColorParser(),
      (options) => [new LightDarkColorParser(this), { mode: options?.mode }],
      () => new OklabColorParser(),
      () => new ColorFuncColorParser(),
    ];
  }

  public isColorSupported(cssColor: string): boolean {
    return this.parserBuilders.some((builder) => {
      const buildResult = builder();
      const parser = Array.isArray(buildResult) ? buildResult[0] : buildResult;
      return parser.isColorSupported(cssColor);
    });
  }

  public parse(cssColor: string, options?: IColorParseOptions): IColor {
    cssColor = cssColor.trim();

    for (const builder of this.parserBuilders) {
      const buildResult = builder(options);
      const parser = Array.isArray(buildResult) ? buildResult[0] : buildResult;
      const parserOptions = Array.isArray(buildResult) ? buildResult[1] : undefined;

      const isColorSupported = parser.isColorSupported(cssColor);
      if (isColorSupported === false) {
        continue;
      }

      return parser.parse(cssColor, parserOptions);
    }

    throw new Error('Invalid or not supported CSS color');
  }
}
