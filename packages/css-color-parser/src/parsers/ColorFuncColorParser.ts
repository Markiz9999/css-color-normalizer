import { Color } from '../Color';
import { CssUnitParser } from '../CssUnitParser';
import { IColor } from '../interfaces/IColor';
import { IColorParser } from '../interfaces/IColorParser';
import { ColorConversionUtils } from '../utils/ColorConversionUtils';

enum ColorSpace {
  Srgb = 'srgb',
  SrgbLinear = 'srgb-linear',
  DisplayP3 = 'display-p3',
  A98Rgb = 'a98-rgb',
  ProPhotoRgb = 'prophoto-rgb',
  Rec2020 = 'rec2020',
  Xyz = 'xyz',
  XyzD50 = 'xyz-d50',
  XyzD65 = 'xyz-d65',
}

export class ColorFuncColorParser implements IColorParser {
  protected unitParser: CssUnitParser;
  protected colorConversionUtils: ColorConversionUtils;

  public constructor() {
    this.unitParser = new CssUnitParser();
    this.colorConversionUtils = new ColorConversionUtils();
  }

  public parse(cssColor: string): IColor {
    cssColor = cssColor.toLowerCase();

    if (!(cssColor.startsWith('color(') && cssColor.endsWith(')'))) {
      throw new Error('Invalid css color');
    }

    const { colorSpace, c1, c2, c3, alpha } = this.getArgs(cssColor);

    const { R, G, B } = this.convertToRgb(colorSpace, c1, c2, c3);

    return new Color(alpha ?? 255, R, G, B);
  }

  protected convertToRgb(colorSpace: string, c1: number, c2: number, c3: number): { R: number; G: number; B: number } {
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
      R: Math.max(0, Math.min(1, color.R)),
      G: Math.max(0, Math.min(1, color.G)),
      B: Math.max(0, Math.min(1, color.B)),
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
    const { X, Y, Z } = this.colorConversionUtils.d50XyzToD65Xyz(d50X, d50Y, d50Z);
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

  protected fromRec2020(r2020R: number, r2020G: number, r2020B: number): { R: number; G: number; B: number } {
    const { R: lR2020R, G: lR2020G, B: lr2020B } = this.colorConversionUtils.rec2020ToLinearRec2020(r2020R, r2020G, r2020B);
    const { X, Y, Z } = this.colorConversionUtils.linearRec2020ToXyz(lR2020R, lR2020G, lr2020B);
    return this.fromXyz(X, Y, Z);
  }

  protected getArgs(cssColor: string): { colorSpace: ColorSpace; c1: number; c2: number; c3: number; alpha?: number } {
    const funcBodyStartsAt = cssColor.indexOf('(');
    const funcBodyEndsAt = cssColor.lastIndexOf(')');
    const funcBody = cssColor.slice(funcBodyStartsAt + 1, funcBodyEndsAt);

    const [color, alphaArg] = funcBody
      .replace(/\s{2,}/, ' ')
      .split('/')
      .map((value) => value.trim());
    const args = color.split(' ');
    if (args.length !== 4) {
      throw new Error('Invalid number of color function arguments');
    }

    const [colorSpace, c1Arg, c2Arg, c3Arg] = args;

    if (!this.isColorSpace(colorSpace)) {
      throw new Error('Invalid color space');
    }

    const c1 = this.parseComponentValue(c1Arg);
    const c2 = this.parseComponentValue(c2Arg);
    const c3 = this.parseComponentValue(c3Arg);

    const alpha = alphaArg != null ? this.parseAlphaChannelValue(alphaArg) : undefined;

    return { colorSpace, c1, c2, c3, alpha };
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
      valueNumber = cssValue.value / 100;
    } else {
      valueNumber = this.unitParser.parseDecimal(value);
    }

    return Math.max(0, Math.min(1, valueNumber));
  }

  protected isColorSpace(colorSpace: string): colorSpace is ColorSpace {
    return Object.values<string>(ColorSpace).includes(colorSpace);
  }
}
