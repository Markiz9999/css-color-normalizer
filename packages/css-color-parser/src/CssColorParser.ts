import { IColor } from './interfaces/IColor';
import { IColorParser } from './interfaces/IColorParser';
import { ILightDarkColorParseOptions } from './interfaces/ILightDarkColorParseOptions';
import { ColorFuncColorParser } from './parsers/ColorFuncColorParser';
import { ColorMixFuncColorParser } from './parsers/ColorMixFuncColorParser';
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
      () => new ColorMixFuncColorParser(this),
    ];
  }

  public parse(cssColor: string, options?: IColorParseOptions): IColor {
    cssColor = cssColor.trim();

    for (const builder of this.parserBuilders) {
      const buildResult = builder(options);

      const [parser, parserOptions] = Array.isArray(buildResult) ? buildResult : [buildResult];

      let color: IColor | undefined;
      try {
        color = parser.parse(cssColor, parserOptions);
      } catch {
        // empty catch
      }

      if (color != null) {
        return color;
      }
    }

    throw new Error('Invalid or not supported CSS color');
  }
}
