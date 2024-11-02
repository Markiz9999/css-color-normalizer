import { ColorParseMode } from '../enums/ColorParseMode';
import { IColor } from '../interfaces/IColor';
import { IColorParser } from '../interfaces/IColorParser';
import { ILightDarkColorParseOptions } from '../interfaces/ILightDarkColorParseOptions';

export class LightDarkColorParser<
  ColorParserOptions,
  ColorParser extends IColorParser<ColorParserOptions> = IColorParser<ColorParserOptions>,
> implements IColorParser<ILightDarkColorParseOptions & ColorParserOptions>
{
  public constructor(protected colorParser: ColorParser) {}

  public parse(cssColor: string, options?: ILightDarkColorParseOptions & ColorParserOptions): IColor {
    const { mode, ...colorParserOptions } = options ?? {};

    cssColor = cssColor.toLowerCase();

    if (!(cssColor.startsWith('light-dark(') && cssColor.endsWith(')'))) {
      throw new Error('Invalid css color');
    }

    const [color1, color2] = this.getArgs(cssColor, colorParserOptions as ColorParserOptions);

    return mode === ColorParseMode.Dark ? color2 : color1;
  }

  protected getArgs(cssColor: string, options?: ColorParserOptions): [IColor, IColor] {
    const funcBodyStartsAt = cssColor.indexOf('(');
    const funcBodyEndsAt = cssColor.lastIndexOf(')');
    const funcBody = cssColor.slice(funcBodyStartsAt + 1, funcBodyEndsAt);

    const args = funcBody.split(',').map((value) => value.trim());
    if (args.length !== 2) {
      throw new Error('Invalid number of light-dark function arguments');
    }

    return [this.colorParser.parse(args[0], options), this.colorParser.parse(args[1], options)];
  }
}
