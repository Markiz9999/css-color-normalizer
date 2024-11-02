import { Color } from '../Color';
import { CssUnitParser } from '../CssUnitParser';
import { IColor } from '../interfaces/IColor';
import { IColorParser } from '../interfaces/IColorParser';

export abstract class SRgbSpaceColorParser implements IColorParser {
  protected unitParser: CssUnitParser;

  public constructor(protected functionName: string) {
    this.unitParser = new CssUnitParser();
  }

  public parse(cssColor: string): IColor {
    cssColor = cssColor.toLowerCase();

    if (!((cssColor.startsWith(`${this.functionName}(`) || cssColor.startsWith(`${this.functionName}a(`)) && cssColor.endsWith(')'))) {
      throw new Error('Invalid css color');
    }

    // rgba(123, 45, 67 / 0.5) is not supported by specification but we will!
    // https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/rgb#syntax

    // const isCommasSeparated = cssColor.includes(',');
    // const isAlphaSlashSeparated = cssColor.includes('/');
    // if (isCommasSeparated && isAlphaSlashSeparated) {
    //   throw new Error('Invalid css color');
    // }

    const funcBodyStartsAt = cssColor.indexOf('(');
    const funcBodyEndsAt = cssColor.lastIndexOf(')');
    const funcBody = cssColor.slice(funcBodyStartsAt + 1, funcBodyEndsAt);

    let args: string[];
    let A: number | undefined;

    const [color, alpha] = funcBody
      .replace(/\s{2,}/, ' ')
      .split('/')
      .map((value) => value.trim());

    if (cssColor.includes(',')) {
      const parameters = color.split(',').map((parameter) => parameter.trim());

      // for some reason the first comma is not required in this syntax, so...
      const spaceInFirstArg = parameters[0].indexOf(' ');
      if (spaceInFirstArg >= 0 && alpha == null) {
        const firstArg = parameters[0];
        parameters.unshift(firstArg.slice(0, spaceInFirstArg).trim());
        parameters[1] = firstArg.slice(spaceInFirstArg).trim();
      }

      if (parameters.length < 3 || parameters.length > 4 || (alpha != null && parameters.length === 4)) {
        throw new Error(`Invalid number of ${this.functionName}(a) function arguments`);
      }

      args = parameters.slice(0, 3);
      A = parameters[3] != null ? this.parseAlphaChannelValue(parameters[3]) : undefined;
    } else {
      args = color.split(' ');
      if (args.length !== 3) {
        throw new Error(`Invalid number of ${this.functionName}(a) function arguments`);
      }
    }

    const { R, G, B } = this.convertToRgb(args);
    A = alpha != null ? this.parseAlphaChannelValue(alpha) : A;

    return new Color(A ?? 1, R, G, B);
  }

  protected abstract convertToRgb(args: string[]): { R: number; G: number; B: number };

  protected parseAlphaChannelValue(value: string): number {
    if (value === 'none') {
      value = '0';
    }

    let valueNumber: number;

    if (value.endsWith('%')) {
      const cssValue = this.unitParser.parsePercentage(value);
      valueNumber = cssValue.value / 100;
    } else {
      valueNumber = this.unitParser.parseDecimal(value);
    }

    return Math.max(0, Math.min(1, valueNumber));
  }
}
