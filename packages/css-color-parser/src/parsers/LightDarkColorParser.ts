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

  public isColorSupported(cssColor: string): boolean {
    cssColor = cssColor.toLowerCase();

    if (!(cssColor.startsWith('light-dark(') && cssColor.endsWith(')'))) {
      return false;
    }

    try {
      const args = this.getArgs(cssColor);

      return this.colorParser.isColorSupported(args[0]) && this.colorParser.isColorSupported(args[1]);
    } catch {
      return false;
    }
  }

  public parse(cssColor: string, options?: ILightDarkColorParseOptions & ColorParserOptions): IColor {
    const { mode, ...colorParserOptions } = options ?? {};
    if (!this.isColorSupported(cssColor)) {
      throw new Error('Invalid css color');
    }

    const args = this.getArgs(cssColor);

    if (mode === ColorParseMode.Dark) {
      return this.colorParser.parse(args[1], colorParserOptions as ColorParserOptions);
    } else {
      return this.colorParser.parse(args[0], colorParserOptions as ColorParserOptions);
    }
  }

  protected getArgs(cssColor: string): [string, string] {
    const funcBodyStartsAt = cssColor.indexOf('(');
    const funcBodyEndsAt = cssColor.lastIndexOf(')');
    const funcBody = cssColor.slice(funcBodyStartsAt + 1, funcBodyEndsAt);

    const args = funcBody.split(',').map((value) => value.trim());
    if (args.length !== 2) {
      throw new Error('Invalid number of light-dark function arguments');
    }

    return [args[0], args[1]];
  }
}
