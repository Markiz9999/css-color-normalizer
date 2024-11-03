import { Color } from '../Color';
import { CssUnitParser } from '../CssUnitParser';
import { IColor } from '../interfaces/IColor';
import { IColorParser } from '../interfaces/IColorParser';
import { ColorConversionUtils } from '../utils/ColorConversionUtils';

export class OklabColorParser implements IColorParser {
  protected unitParser: CssUnitParser;
  protected colorConversionUtils: ColorConversionUtils;

  public constructor() {
    this.unitParser = new CssUnitParser();
    this.colorConversionUtils = new ColorConversionUtils();
  }

  public parse(cssColor: string): IColor {
    cssColor = cssColor.toLowerCase();

    if (!(cssColor.startsWith('oklab(') && cssColor.endsWith(')'))) {
      throw new Error('Invalid css color');
    }

    const funcBodyStartsAt = cssColor.indexOf('(');
    const funcBodyEndsAt = cssColor.lastIndexOf(')');
    const funcBody = cssColor.slice(funcBodyStartsAt + 1, funcBodyEndsAt);

    const [color, alpha] = funcBody
      .replace(/\s{2,}/, ' ')
      .split('/')
      .map((value) => value.trim());

    const args = color.split(' ');
    if (args.length !== 3) {
      throw new Error(`Invalid number of oklab function arguments`);
    }

    const { R, G, B } = this.convertToRgb(args);
    const A = alpha != null ? this.parseAlphaChannelValue(alpha) : undefined;

    return new Color(A ?? 1, R, G, B);
  }

  protected convertToRgb(args: string[]): { R: number; G: number; B: number } {
    args = args.map((arg) => (arg === 'none' ? '0' : arg));

    const lightness = this.parseLightnessValue(args[0]);
    const aAxis = this.parseAxisValue(args[1]);
    const bAxis = this.parseAxisValue(args[2]);

    // const { R: lR, G: lG, B: lB } = this.colorConversionUtils.oklabToLinearRgb(lightness, aAxis, bAxis);
    // const { R, G, B } = this.colorConversionUtils.linearRgbToRgb(lR, lG, lB);

    const { X, Y, Z } = this.colorConversionUtils.oklabToXyz(lightness, aAxis, bAxis);
    const { R: lR, G: lG, B: lB } = this.colorConversionUtils.xyzToLinearRgb(X, Y, Z);
    const { R, G, B } = this.colorConversionUtils.linearRgbToRgb(lR, lG, lB);

    return {
      R: Math.max(0, Math.min(1, R)),
      G: Math.max(0, Math.min(1, G)),
      B: Math.max(0, Math.min(1, B)),
    };
  }

  protected parseLightnessValue(value: string): number {
    if (value === 'none') {
      value = '0%';
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

  protected parseAxisValue(value: string): number {
    if (value === 'none') {
      value = '0%';
    }

    let valueNumber: number;

    if (value.endsWith('%')) {
      const cssValue = this.unitParser.parsePercentage(value);
      valueNumber = (cssValue.value / 100) * 0.4;
    } else {
      valueNumber = this.unitParser.parseDecimal(value);
    }

    return valueNumber;
  }

  protected parseAlphaChannelValue(value: string): number {
    if (value === 'none') {
      value = '0%';
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
