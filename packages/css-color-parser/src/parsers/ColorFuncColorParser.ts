import { Color } from '../Color';
import { CssUnitParser } from '../CssUnitParser';
import { IColor } from '../interfaces/IColor';
import { IColorParser } from '../interfaces/IColorParser';
import { ColorConversionUtils } from '../utils/ColorConversionUtils';
import { round } from '../utils/NumberUtils';

export class ColorFuncColorParser implements IColorParser {
  protected unitParser: CssUnitParser;
  protected colorConversionUtils: ColorConversionUtils;

  public constructor() {
    this.unitParser = new CssUnitParser();
    this.colorConversionUtils = new ColorConversionUtils();
  }

  public isColorSupported(cssColor: string): boolean {
    cssColor = cssColor.toLowerCase();

    if (!(cssColor.startsWith('color(') && cssColor.endsWith(')'))) {
      return false;
    }

    try {
      const [colorSpace] = this.getArgs(cssColor);
      if (
        ['srgb', 'srgb-linear', 'display-p3', 'a98-rgb', 'prophoto-rgb', 'rec2020', 'xyz', 'xyz-d50', 'xyz-d65'].includes(colorSpace) ===
        false
      ) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  public parse(cssColor: string): IColor {
    if (!this.isColorSupported(cssColor)) {
      throw new Error('Invalid css color');
    }

    const [colorSpace, c1, c2, c3, alpha] = this.getArgs(cssColor);

    const { R, G, B } = this.convertToRgb(colorSpace, [c1, c2, c3]);
    const A = alpha != null ? this.parseAlphaChannelValue(alpha) : undefined;

    return new Color(A ?? 255, R, G, B);
  }

  protected convertToRgb(colorSpace: string, args: string[]): { R: number; G: number; B: number } {
    if (args.length !== 3) {
      throw new Error('Invalid number of arguments');
    }

    colorSpace = colorSpace.toLowerCase();

    const c1 = this.parseComponentValue(args[0]);
    const c2 = this.parseComponentValue(args[1]);
    const c3 = this.parseComponentValue(args[2]);

    let color: { R: number; G: number; B: number };

    if (colorSpace === 'srgb') {
      color = this.fromRgb(c1, c2, c3);
    } else if (colorSpace === 'srgb-linear') {
      color = this.fromLinearRgb(c1, c2, c3);
    } else if (colorSpace === 'display-p3') {
      color = this.fromDisplayP3(c1, c2, c3);
    } else if (colorSpace === 'a98-rgb') {
      color = this.fromA98Rgb(c1, c2, c3);
    } else if (colorSpace === 'prophoto-rgb') {
      color = this.fromProPhotoRgb(c1, c2, c3);
    } else if (colorSpace === 'rec2020') {
      color = this.fromRec2020(c1, c2, c3);
    } else if (colorSpace === 'xyz' || colorSpace === 'xyz-d65') {
      color = this.fromXyz(c1, c2, c3);
    } else if (colorSpace === 'xyz-d50') {
      color = this.fromD50Xyz(c1, c2, c3);
    } else {
      throw new Error('Invalid color space');
    }

    return {
      R: Math.round(round(Math.max(0, Math.min(1, color.R)), 4) * 255),
      G: Math.round(round(Math.max(0, Math.min(1, color.G)), 4) * 255),
      B: Math.round(round(Math.max(0, Math.min(1, color.B)), 4) * 255),
    };
  }

  protected fromRgb(R: number, G: number, B: number): { R: number; G: number; B: number } {
    return { R, G, B };
  }

  protected fromLinearRgb(lR: number, lG: number, lB: number): { R: number; G: number; B: number } {
    return this.colorConversionUtils.linearRgbToRgb(lR, lG, lB);
  }

  protected fromXyz(X: number, Y: number, Z: number): { R: number; G: number; B: number } {
    const { R: lR, G: lG, B: lB } = this.colorConversionUtils.xyzToLinearRgb(X, Y, Z);
    return this.fromLinearRgb(lR, lG, lB);
  }

  protected fromD50Xyz(d50X: number, d50Y: number, d50Z: number): { R: number; G: number; B: number } {
    const { X, Y, Z } = this.colorConversionUtils.D50XyzToD65Xyz(d50X, d50Y, d50Z);
    const { R: lR, G: lG, B: lB } = this.colorConversionUtils.xyzToLinearRgb(X, Y, Z);
    return this.fromLinearRgb(lR, lG, lB);
  }

  protected fromDisplayP3(p3R: number, p3G: number, p3B: number): { R: number; G: number; B: number } {
    const { R: lP3R, G: lP3G, B: lP3B } = this.colorConversionUtils.rgbToLinearRgb(p3R, p3G, p3B);
    const { X, Y, Z } = this.colorConversionUtils.linearP3ToXyz(lP3R, lP3G, lP3B);
    return this.fromXyz(X, Y, Z);
  }

  protected fromA98Rgb(a98R: number, a98G: number, a98B: number): { R: number; G: number; B: number } {
    const { R: lA98R, G: lA98G, B: lA98B } = this.colorConversionUtils.a98RgbToLinearA98Rgb(a98R, a98G, a98B);
    const { X, Y, Z } = this.colorConversionUtils.linearA98RgbToXyz(lA98R, lA98G, lA98B);
    return this.fromXyz(X, Y, Z);
  }

  protected fromProPhotoRgb(phR: number, phG: number, phB: number): { R: number; G: number; B: number } {
    const { R: lPhR, G: lPhG, B: lPhB } = this.colorConversionUtils.proPhotoRgbToLinearProPhotoRgb(phR, phG, phB);
    const { X: d50X, Y: d50Y, Z: d50Z } = this.colorConversionUtils.linearProPhotoToD50Xyz(lPhR, lPhG, lPhB);
    return this.fromD50Xyz(d50X, d50Y, d50Z);
  }

  protected fromRec2020(a98R: number, a98G: number, a98B: number): { R: number; G: number; B: number } {
    const { R: lA98R, G: lA98G, B: lA98B } = this.colorConversionUtils.rec2020ToLinearRec2020(a98R, a98G, a98B);
    const { X, Y, Z } = this.colorConversionUtils.linearRec2020ToXyz(lA98R, lA98G, lA98B);
    return this.fromXyz(X, Y, Z);
  }

  protected parseComponentValue(value: string): number {
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

    return valueNumber;
  }

  protected parseAlphaChannelValue(value: string): number {
    if (value === 'none') {
      value = '0';
    }

    let valueNumber: number;

    if (value.endsWith('%')) {
      const cssValue = this.unitParser.parsePercentage(value);
      valueNumber = (cssValue.value / 100) * 255;
    } else {
      valueNumber = this.unitParser.parseDecimal(value) * 255;
    }

    return Math.ceil(Math.max(0, Math.min(255, valueNumber)));
  }

  protected getArgs(cssColor: string): string[] {
    const funcBodyStartsAt = cssColor.indexOf('(');
    const funcBodyEndsAt = cssColor.lastIndexOf(')');
    const funcBody = cssColor.slice(funcBodyStartsAt + 1, funcBodyEndsAt);

    const [color, alpha] = funcBody
      .replace(/\s{2,}/, ' ')
      .split('/')
      .map((value) => value.trim());
    const args = color.split(' ');
    if (args.length !== 4) {
      throw new Error('Invalid number of color function arguments');
    }

    return [...args, alpha];
  }
}
