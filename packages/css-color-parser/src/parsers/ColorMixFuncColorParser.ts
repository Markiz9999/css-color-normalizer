import { Color } from '../Color';
import { CssUnitParser } from '../CssUnitParser';
import { IColor } from '../interfaces/IColor';
import { IColorParser } from '../interfaces/IColorParser';
import { ColorConversionUtils } from '../utils/ColorConversionUtils';

enum RectangularColorSpace {
  Srgb = 'srgb',
  SrgbLinear = 'srgb-linear',
  DisplayP3 = 'display-p3',
  A98Rgb = 'a98-rgb',
  ProPhotoRgb = 'prophoto-rgb',
  Rec2020 = 'rec2020',
  Lab = 'lab',
  Oklab = 'oklab',
  Xyz = 'xyz',
  XyzD50 = 'xyz-d50',
  XyzD65 = 'xyz-d65',
}

enum PolarColorSpace {
  Hsl = 'hsl',
  Hwb = 'hwb',
  Lch = 'lch',
  Oklch = 'oklch',
}

enum HueInterpolationMethod {
  Shorter = 'shorter',
  Longer = 'longer',
  Increasing = 'increasing',
  Decreasing = 'decreasing',
}

interface IRectangularColor {
  c1: number;
  c2: number;
  c3: number;
  alpha: number;
}

interface IPolarColor {
  H: number;
  c1: number;
  c2: number;
  alpha: number;
}

export class ColorMixFuncColorParser<
  ColorParserOptions,
  ColorParser extends IColorParser<ColorParserOptions> = IColorParser<ColorParserOptions>,
> implements IColorParser
{
  protected unitParser: CssUnitParser;
  protected colorConversionUtils: ColorConversionUtils;

  public constructor(protected cssColorParser: ColorParser) {
    this.unitParser = new CssUnitParser();
    this.colorConversionUtils = new ColorConversionUtils();
  }

  public parse(cssColor: string, options?: ColorParserOptions): IColor {
    cssColor = cssColor.toLowerCase();

    if (!(cssColor.startsWith('color-mix(') && cssColor.endsWith(')'))) {
      throw new Error('Invalid css color');
    }

    const args = this.getArgs(cssColor, options);

    let fraction1 = args.color1Fraction;
    let fraction2 = args.color2Fraction;
    if (fraction1 == null && fraction2 == null) {
      fraction1 = 0.5;
      fraction2 = 0.5;
    } else if (fraction1 != null && fraction2 != null) {
      const fractionSum = fraction1 + fraction2;
      if (fractionSum === 0) {
        throw new Error('Invalid fractions');
      }

      fraction1 = fraction1 / fractionSum;
      fraction2 = fraction2 / fractionSum;
    } else if (fraction1 != null) {
      fraction2 = 1 - fraction1;
    } else if (fraction2 != null) {
      fraction1 = 1 - fraction2;
    }

    if (fraction1 == null || fraction2 == null) {
      throw new Error('Unknown error');
    }

    if (args.colorSpace === RectangularColorSpace.Srgb) {
      return this.mixRgbColors(args.color1, args.color2, fraction1, fraction2);
    } else if (args.colorSpace === RectangularColorSpace.SrgbLinear) {
      return this.mixLinearRgbColors(args.color1, args.color2, fraction1, fraction2);
    } else if (args.colorSpace === RectangularColorSpace.DisplayP3) {
      return this.mixDisplayP3Colors(args.color1, args.color2, fraction1, fraction2);
    } else if (args.colorSpace === RectangularColorSpace.A98Rgb) {
      return this.mixA98RgbColors(args.color1, args.color2, fraction1, fraction2);
    } else if (args.colorSpace === RectangularColorSpace.ProPhotoRgb) {
      return this.mixProPhotoRgbColors(args.color1, args.color2, fraction1, fraction2);
    } else if (args.colorSpace === RectangularColorSpace.Rec2020) {
      return this.mixRec2020Colors(args.color1, args.color2, fraction1, fraction2);
    } else if (args.colorSpace === RectangularColorSpace.Lab) {
      return this.mixLabColors(args.color1, args.color2, fraction1, fraction2);
    } else if (args.colorSpace === RectangularColorSpace.Oklab) {
      return this.mixOklabColors(args.color1, args.color2, fraction1, fraction2);
    } else if (args.colorSpace === RectangularColorSpace.Xyz || args.colorSpace === RectangularColorSpace.XyzD65) {
      return this.mixXyzColors(args.color1, args.color2, fraction1, fraction2);
    } else if (args.colorSpace === RectangularColorSpace.XyzD50) {
      return this.mixXyzD50Colors(args.color1, args.color2, fraction1, fraction2);
    } else if (args.colorSpace === PolarColorSpace.Hsl) {
      return this.mixHslColors(args.color1, args.color2, fraction1, fraction2, args.hueInterpolationMethod);
    } else if (args.colorSpace === PolarColorSpace.Hwb) {
      return this.mixHwbColors(args.color1, args.color2, fraction1, fraction2, args.hueInterpolationMethod);
    } else if (args.colorSpace === PolarColorSpace.Lch) {
      return this.mixLchColors(args.color1, args.color2, fraction1, fraction2, args.hueInterpolationMethod);
    } else if (args.colorSpace === PolarColorSpace.Oklch) {
      return this.mixOklchColors(args.color1, args.color2, fraction1, fraction2, args.hueInterpolationMethod);
    } else {
      throw new Error('Not supported color space');
    }
  }

  protected mixRgbColors(color1: IColor, color2: IColor, fraction1: number, fraction2: number): IColor {
    const { c1, c2, c3, alpha } = this.mixRectangularColors(
      { c1: color1.R, c2: color1.G, c3: color1.B, alpha: color1.A },
      { c1: color2.R, c2: color2.G, c3: color2.B, alpha: color2.A },
      fraction1,
      fraction2,
    );

    return this.createColor(alpha, c1, c2, c3);
  }

  protected mixLinearRgbColors(color1: IColor, color2: IColor, fraction1: number, fraction2: number): IColor {
    const { R: lR1, G: lG1, B: lB1 } = this.colorConversionUtils.rgbToLinearRgb(color1.R, color1.G, color1.B);
    const { R: lR2, G: lG2, B: lB2 } = this.colorConversionUtils.rgbToLinearRgb(color2.R, color2.G, color2.B);

    const { c1, c2, c3, alpha } = this.mixRectangularColors(
      { c1: lR1, c2: lG1, c3: lB1, alpha: color1.A },
      { c1: lR2, c2: lG2, c3: lB2, alpha: color2.A },
      fraction1,
      fraction2,
    );

    const { R, G, B } = this.colorConversionUtils.linearRgbToRgb(c1, c2, c3);
    return this.createColor(alpha, R, G, B);
  }

  protected mixDisplayP3Colors(color1: IColor, color2: IColor, fraction1: number, fraction2: number): IColor {
    const { R: lR1, G: lG1, B: lB1 } = this.colorConversionUtils.rgbToLinearRgb(color1.R, color1.G, color1.B);
    const { R: lR2, G: lG2, B: lB2 } = this.colorConversionUtils.rgbToLinearRgb(color2.R, color2.G, color2.B);
    const { X: X1, Y: Y1, Z: Z1 } = this.colorConversionUtils.linearRgbToXyz(lR1, lG1, lB1);
    const { X: X2, Y: Y2, Z: Z2 } = this.colorConversionUtils.linearRgbToXyz(lR2, lG2, lB2);
    const { R: lPR1, G: lPG1, B: lPB1 } = this.colorConversionUtils.xyzToLinearP3(X1, Y1, Z1);
    const { R: lPR2, G: lPG2, B: lPB2 } = this.colorConversionUtils.xyzToLinearP3(X2, Y2, Z2);
    const { R: R1, G: G1, B: B1 } = this.colorConversionUtils.linearRgbToRgb(lPR1, lPG1, lPB1);
    const { R: R2, G: G2, B: B2 } = this.colorConversionUtils.linearRgbToRgb(lPR2, lPG2, lPB2);

    const { c1, c2, c3, alpha } = this.mixRectangularColors(
      { c1: R1, c2: G1, c3: B1, alpha: color1.A },
      { c1: R2, c2: G2, c3: B2, alpha: color2.A },
      fraction1,
      fraction2,
    );

    const { R: lP3R, G: lP3G, B: lP3B } = this.colorConversionUtils.rgbToLinearRgb(c1, c2, c3);
    const { X, Y, Z } = this.colorConversionUtils.linearP3ToXyz(lP3R, lP3G, lP3B);
    const { R: lR, G: lG, B: lB } = this.colorConversionUtils.xyzToLinearRgb(X, Y, Z);
    const { R, G, B } = this.colorConversionUtils.linearRgbToRgb(lR, lG, lB);

    return this.createColor(alpha, R, G, B);
  }

  protected mixA98RgbColors(color1: IColor, color2: IColor, fraction1: number, fraction2: number): IColor {
    const { R: lR1, G: lG1, B: lB1 } = this.colorConversionUtils.rgbToLinearRgb(color1.R, color1.G, color1.B);
    const { R: lR2, G: lG2, B: lB2 } = this.colorConversionUtils.rgbToLinearRgb(color2.R, color2.G, color2.B);
    const { X: X1, Y: Y1, Z: Z1 } = this.colorConversionUtils.linearRgbToXyz(lR1, lG1, lB1);
    const { X: X2, Y: Y2, Z: Z2 } = this.colorConversionUtils.linearRgbToXyz(lR2, lG2, lB2);
    const { R: lA98R1, G: lA98G1, B: lA98B1 } = this.colorConversionUtils.xyzToLinearA98Rgb(X1, Y1, Z1);
    const { R: lA98R2, G: lA98G2, B: lA98B2 } = this.colorConversionUtils.xyzToLinearA98Rgb(X2, Y2, Z2);
    const { R: R1, G: G1, B: B1 } = this.colorConversionUtils.linearA98RgbToA98Rgb(lA98R1, lA98G1, lA98B1);
    const { R: R2, G: G2, B: B2 } = this.colorConversionUtils.linearA98RgbToA98Rgb(lA98R2, lA98G2, lA98B2);

    const { c1, c2, c3, alpha } = this.mixRectangularColors(
      { c1: R1, c2: G1, c3: B1, alpha: color1.A },
      { c1: R2, c2: G2, c3: B2, alpha: color2.A },
      fraction1,
      fraction2,
    );

    const { R: lA98R, G: lA98G, B: lA98B } = this.colorConversionUtils.a98RgbToLinearA98Rgb(c1, c2, c3);
    const { X, Y, Z } = this.colorConversionUtils.linearA98RgbToXyz(lA98R, lA98G, lA98B);
    const { R: lR, G: lG, B: lB } = this.colorConversionUtils.xyzToLinearRgb(X, Y, Z);
    const { R, G, B } = this.colorConversionUtils.linearRgbToRgb(lR, lG, lB);

    return this.createColor(alpha, R, G, B);
  }

  protected mixProPhotoRgbColors(color1: IColor, color2: IColor, fraction1: number, fraction2: number): IColor {
    const { R: lR1, G: lG1, B: lB1 } = this.colorConversionUtils.rgbToLinearRgb(color1.R, color1.G, color1.B);
    const { R: lR2, G: lG2, B: lB2 } = this.colorConversionUtils.rgbToLinearRgb(color2.R, color2.G, color2.B);
    const { X: X1, Y: Y1, Z: Z1 } = this.colorConversionUtils.linearRgbToXyz(lR1, lG1, lB1);
    const { X: X2, Y: Y2, Z: Z2 } = this.colorConversionUtils.linearRgbToXyz(lR2, lG2, lB2);
    const { X: d50X1, Y: d50Y1, Z: d50Z1 } = this.colorConversionUtils.d65XyzToD50Xyz(X1, Y1, Z1);
    const { X: d50X2, Y: d50Y2, Z: d50Z2 } = this.colorConversionUtils.d65XyzToD50Xyz(X2, Y2, Z2);
    const { R: lPhR1, G: lPhG1, B: lPhB1 } = this.colorConversionUtils.d50XyzToLinearProPhoto(d50X1, d50Y1, d50Z1);
    const { R: lPhR2, G: lPhG2, B: lPhB2 } = this.colorConversionUtils.d50XyzToLinearProPhoto(d50X2, d50Y2, d50Z2);
    const { R: R1, G: G1, B: B1 } = this.colorConversionUtils.linearProPhotoRgbToProPhotoRgb(lPhR1, lPhG1, lPhB1);
    const { R: R2, G: G2, B: B2 } = this.colorConversionUtils.linearProPhotoRgbToProPhotoRgb(lPhR2, lPhG2, lPhB2);

    const { c1, c2, c3, alpha } = this.mixRectangularColors(
      { c1: R1, c2: G1, c3: B1, alpha: color1.A },
      { c1: R2, c2: G2, c3: B2, alpha: color2.A },
      fraction1,
      fraction2,
    );

    const { R: lPhR, G: lPhG, B: lPhB } = this.colorConversionUtils.proPhotoRgbToLinearProPhotoRgb(c1, c2, c3);
    const { X: d50X, Y: d50Y, Z: d50Z } = this.colorConversionUtils.linearProPhotoToD50Xyz(lPhR, lPhG, lPhB);
    const { X, Y, Z } = this.colorConversionUtils.d50XyzToD65Xyz(d50X, d50Y, d50Z);
    const { R: lR, G: lG, B: lB } = this.colorConversionUtils.xyzToLinearRgb(X, Y, Z);
    const { R, G, B } = this.colorConversionUtils.linearRgbToRgb(lR, lG, lB);

    return this.createColor(alpha, R, G, B);
  }

  protected mixRec2020Colors(color1: IColor, color2: IColor, fraction1: number, fraction2: number): IColor {
    const { R: lR1, G: lG1, B: lB1 } = this.colorConversionUtils.rgbToLinearRgb(color1.R, color1.G, color1.B);
    const { R: lR2, G: lG2, B: lB2 } = this.colorConversionUtils.rgbToLinearRgb(color2.R, color2.G, color2.B);
    const { X: X1, Y: Y1, Z: Z1 } = this.colorConversionUtils.linearRgbToXyz(lR1, lG1, lB1);
    const { X: X2, Y: Y2, Z: Z2 } = this.colorConversionUtils.linearRgbToXyz(lR2, lG2, lB2);
    const { R: lR2020R1, G: lR2020G1, B: lR2020B1 } = this.colorConversionUtils.xyzToLinearRec2020(X1, Y1, Z1);
    const { R: lR2020R2, G: lR2020G2, B: lR2020B2 } = this.colorConversionUtils.xyzToLinearRec2020(X2, Y2, Z2);
    const { R: R1, G: G1, B: B1 } = this.colorConversionUtils.linearRec2020ToRec2020(lR2020R1, lR2020G1, lR2020B1);
    const { R: R2, G: G2, B: B2 } = this.colorConversionUtils.linearRec2020ToRec2020(lR2020R2, lR2020G2, lR2020B2);

    const { c1, c2, c3, alpha } = this.mixRectangularColors(
      { c1: R1, c2: G1, c3: B1, alpha: color1.A },
      { c1: R2, c2: G2, c3: B2, alpha: color2.A },
      fraction1,
      fraction2,
    );

    const { R: lR2020R, G: lR2020G, B: lr2020B } = this.colorConversionUtils.rec2020ToLinearRec2020(c1, c2, c3);
    const { X, Y, Z } = this.colorConversionUtils.linearRec2020ToXyz(lR2020R, lR2020G, lr2020B);
    const { R: lR, G: lG, B: lB } = this.colorConversionUtils.xyzToLinearRgb(X, Y, Z);
    const { R, G, B } = this.colorConversionUtils.linearRgbToRgb(lR, lG, lB);

    return this.createColor(alpha, R, G, B);
  }

  protected mixLabColors(color1: IColor, color2: IColor, fraction1: number, fraction2: number): IColor {
    const { L: L1, a: a1, b: b1 } = this.rgbToLab(color1.R, color1.G, color1.B);
    const { L: L2, a: a2, b: b2 } = this.rgbToLab(color2.R, color2.G, color2.B);

    const { c1, c2, c3, alpha } = this.mixRectangularColors(
      { c1: L1, c2: a1, c3: b1, alpha: color1.A },
      { c1: L2, c2: a2, c3: b2, alpha: color2.A },
      fraction1,
      fraction2,
    );

    const { R, G, B } = this.labToRgb(c1, c2, c3);

    return this.createColor(alpha, R, G, B);
  }

  protected mixOklabColors(color1: IColor, color2: IColor, fraction1: number, fraction2: number): IColor {
    const { L: L1, a: a1, b: b1 } = this.rgbToOklab(color1.R, color1.G, color1.B);
    const { L: L2, a: a2, b: b2 } = this.rgbToOklab(color2.R, color2.G, color2.B);

    const { c1, c2, c3, alpha } = this.mixRectangularColors(
      { c1: L1, c2: a1, c3: b1, alpha: color1.A },
      { c1: L2, c2: a2, c3: b2, alpha: color2.A },
      fraction1,
      fraction2,
    );

    const { R, G, B } = this.oklabToRgb(c1, c2, c3);

    return this.createColor(alpha, R, G, B);
  }

  protected mixXyzColors(color1: IColor, color2: IColor, fraction1: number, fraction2: number): IColor {
    const { R: lR1, G: lG1, B: lB1 } = this.colorConversionUtils.rgbToLinearRgb(color1.R, color1.G, color1.B);
    const { R: lR2, G: lG2, B: lB2 } = this.colorConversionUtils.rgbToLinearRgb(color2.R, color2.G, color2.B);
    const { X: X1, Y: Y1, Z: Z1 } = this.colorConversionUtils.linearRgbToXyz(lR1, lG1, lB1);
    const { X: X2, Y: Y2, Z: Z2 } = this.colorConversionUtils.linearRgbToXyz(lR2, lG2, lB2);

    const { c1, c2, c3, alpha } = this.mixRectangularColors(
      { c1: X1, c2: Y1, c3: Z1, alpha: color1.A },
      { c1: X2, c2: Y2, c3: Z2, alpha: color2.A },
      fraction1,
      fraction2,
    );

    const { R: lR, G: lG, B: lB } = this.colorConversionUtils.xyzToLinearRgb(c1, c2, c3);
    const { R, G, B } = this.colorConversionUtils.linearRgbToRgb(lR, lG, lB);

    return this.createColor(alpha, R, G, B);
  }

  protected mixXyzD50Colors(color1: IColor, color2: IColor, fraction1: number, fraction2: number): IColor {
    const { R: lR1, G: lG1, B: lB1 } = this.colorConversionUtils.rgbToLinearRgb(color1.R, color1.G, color1.B);
    const { R: lR2, G: lG2, B: lB2 } = this.colorConversionUtils.rgbToLinearRgb(color2.R, color2.G, color2.B);
    const { X: X1, Y: Y1, Z: Z1 } = this.colorConversionUtils.linearRgbToXyz(lR1, lG1, lB1);
    const { X: X2, Y: Y2, Z: Z2 } = this.colorConversionUtils.linearRgbToXyz(lR2, lG2, lB2);
    const { X: d50X1, Y: d50Y1, Z: d50Z1 } = this.colorConversionUtils.d65XyzToD50Xyz(X1, Y1, Z1);
    const { X: d50X2, Y: d50Y2, Z: d50Z2 } = this.colorConversionUtils.d65XyzToD50Xyz(X2, Y2, Z2);

    const { c1, c2, c3, alpha } = this.mixRectangularColors(
      { c1: d50X1, c2: d50Y1, c3: d50Z1, alpha: color1.A },
      { c1: d50X2, c2: d50Y2, c3: d50Z2, alpha: color2.A },
      fraction1,
      fraction2,
    );

    const { X, Y, Z } = this.colorConversionUtils.d50XyzToD65Xyz(c1, c2, c3);
    const { R: lR, G: lG, B: lB } = this.colorConversionUtils.xyzToLinearRgb(X, Y, Z);
    const { R, G, B } = this.colorConversionUtils.linearRgbToRgb(lR, lG, lB);

    return this.createColor(alpha, R, G, B);
  }

  protected mixHslColors(
    color1: IColor,
    color2: IColor,
    fraction1: number,
    fraction2: number,
    hueInterpolationMethod?: HueInterpolationMethod,
  ): IColor {
    const { H: H1, S: S1, L: L1 } = this.colorConversionUtils.rgbToHsl(color1.R, color1.G, color1.B);
    const { H: H2, S: S2, L: L2 } = this.colorConversionUtils.rgbToHsl(color2.R, color2.G, color2.B);

    const {
      H,
      c1: S,
      c2: L,
      alpha,
    } = this.mixPolarColors(
      { H: H1, c1: S1, c2: L1, alpha: color1.A },
      { H: H2, c1: S2, c2: L2, alpha: color2.A },
      fraction1,
      fraction2,
      hueInterpolationMethod,
    );

    const { R, G, B } = this.colorConversionUtils.hslToRgb(H, S, L);

    return this.createColor(alpha, R, G, B);
  }

  protected mixHwbColors(
    color1: IColor,
    color2: IColor,
    fraction1: number,
    fraction2: number,
    hueInterpolationMethod?: HueInterpolationMethod,
  ): IColor {
    const { H: H1, W: W1, B: B1 } = this.colorConversionUtils.rgbToHwb(color1.R, color1.G, color1.B);
    const { H: H2, W: W2, B: B2 } = this.colorConversionUtils.rgbToHwb(color2.R, color2.G, color2.B);

    const {
      H: H_HWB,
      c1: W_HWB,
      c2: B_HWB,
      alpha,
    } = this.mixPolarColors(
      { H: H1, c1: W1, c2: B1, alpha: color1.A },
      { H: H2, c1: W2, c2: B2, alpha: color2.A },
      fraction1,
      fraction2,
      hueInterpolationMethod,
    );

    const { H: H_HSV, S, V } = this.colorConversionUtils.hwbToHsv(H_HWB, W_HWB, B_HWB);
    const { R, G, B } = this.colorConversionUtils.hsvToRgb(H_HSV, S, V);

    return this.createColor(alpha, R, G, B);
  }

  protected mixLchColors(
    color1: IColor,
    color2: IColor,
    fraction1: number,
    fraction2: number,
    hueInterpolationMethod?: HueInterpolationMethod,
  ): IColor {
    const { L: L1_Lab, a: a1, b: b1 } = this.rgbToLab(color1.R, color1.G, color1.B);
    const { L: L2_Lab, a: a2, b: b2 } = this.rgbToLab(color2.R, color2.G, color2.B);
    const { L: L1, C: C1, H: H1 } = this.colorConversionUtils.labToLch(L1_Lab, a1, b1);
    const { L: L2, C: C2, H: H2 } = this.colorConversionUtils.labToLch(L2_Lab, a2, b2);

    const {
      H,
      c1: L,
      c2: C,
      alpha,
    } = this.mixPolarColors(
      { H: H1, c1: L1, c2: C1, alpha: color1.A },
      { H: H2, c1: L2, c2: C2, alpha: color2.A },
      fraction1,
      fraction2,
      hueInterpolationMethod,
    );

    const { L: L_Lab, a, b } = this.colorConversionUtils.lchToLab(L, C, H);
    const { R, G, B } = this.labToRgb(L_Lab, a, b);

    return this.createColor(alpha, R, G, B);
  }

  protected mixOklchColors(
    color1: IColor,
    color2: IColor,
    fraction1: number,
    fraction2: number,
    hueInterpolationMethod?: HueInterpolationMethod,
  ): IColor {
    const { L: L1_Lab, a: a1, b: b1 } = this.rgbToOklab(color1.R, color1.G, color1.B);
    const { L: L2_Lab, a: a2, b: b2 } = this.rgbToOklab(color2.R, color2.G, color2.B);
    const { L: L1, C: C1, H: H1 } = this.colorConversionUtils.oklabToOklch(L1_Lab, a1, b1);
    const { L: L2, C: C2, H: H2 } = this.colorConversionUtils.oklabToOklch(L2_Lab, a2, b2);

    const {
      H,
      c1: L,
      c2: C,
      alpha,
    } = this.mixPolarColors(
      { H: H1, c1: L1, c2: C1, alpha: color1.A },
      { H: H2, c1: L2, c2: C2, alpha: color2.A },
      fraction1,
      fraction2,
      hueInterpolationMethod,
    );

    const { L: L_Lab, a, b } = this.colorConversionUtils.oklchToOklab(L, C, H);
    const { R, G, B } = this.oklabToRgb(L_Lab, a, b);

    return this.createColor(alpha, R, G, B);
  }

  protected mixRectangularColors(
    color1: IRectangularColor,
    color2: IRectangularColor,
    fraction1: number,
    fraction2: number,
  ): IRectangularColor {
    const { c1: c11, c2: c21, c3: c31 } = this.rectangularPremultiply(color1.c1, color1.c2, color1.c3, color1.alpha);
    const { c1: c12, c2: c22, c3: c32 } = this.rectangularPremultiply(color2.c1, color2.c2, color2.c3, color2.alpha);

    const alpha = this.mixAlpha(color1.alpha, color2.alpha, fraction1, fraction2);
    const { c1, c2, c3 } = this.rectangularUnPremultiply(
      c11 * fraction1 + c12 * fraction2,
      c21 * fraction1 + c22 * fraction2,
      c31 * fraction1 + c32 * fraction2,
      alpha,
    );

    return { c1, c2, c3, alpha };
  }

  protected mixPolarColors(
    color1: IPolarColor,
    color2: IPolarColor,
    fraction1: number,
    fraction2: number,
    hueInterpolationMethod: HueInterpolationMethod = HueInterpolationMethod.Shorter,
  ): IPolarColor {
    const { c1: c11, c2: c21 } = this.polarPremultiply(color1.c1, color1.c2, color1.alpha);
    const { c1: c12, c2: c22 } = this.polarPremultiply(color2.c1, color2.c2, color2.alpha);

    const alpha = this.mixAlpha(color1.alpha, color2.alpha, fraction1, fraction2);
    const { c1, c2 } = this.polarUnPremultiply(c11 * fraction1 + c12 * fraction2, c21 * fraction1 + c22 * fraction2, alpha);

    let H1: number = color1.H;
    let H2: number = color2.H;

    if (hueInterpolationMethod === HueInterpolationMethod.Shorter) {
      const diff = H2 - H1;
      if (diff > 180) {
        H1 += 360;
      } else if (diff < -180) {
        H2 += 360;
      }
    } else if (hueInterpolationMethod === HueInterpolationMethod.Longer) {
      const diff = H2 - H1;
      if (diff > 0 && diff < 180) {
        H1 += 360;
      } else if (diff > -180 && diff <= 0) {
        H2 += 360;
      }
    } else if (hueInterpolationMethod === HueInterpolationMethod.Increasing) {
      if (H2 < H1) {
        H2 += 360;
      }
    } else if (hueInterpolationMethod === HueInterpolationMethod.Decreasing) {
      if (H1 < H2) {
        H1 += 360;
      }
    }

    return { H: H1 * fraction1 + H2 * fraction2, c1, c2, alpha };
  }

  protected rgbToLab(R: number, G: number, B: number): { L: number; a: number; b: number } {
    const { R: lR1, G: lG1, B: lB1 } = this.colorConversionUtils.rgbToLinearRgb(R, G, B);
    const { X: X1, Y: Y1, Z: Z1 } = this.colorConversionUtils.linearRgbToXyz(lR1, lG1, lB1);
    const { X: d50X1, Y: d50Y1, Z: d50Z1 } = this.colorConversionUtils.d65XyzToD50Xyz(X1, Y1, Z1);
    return this.colorConversionUtils.d50XyzToLab(d50X1, d50Y1, d50Z1);
  }

  protected labToRgb(L: number, a: number, b: number): { R: number; G: number; B: number } {
    const { X: d50X, Y: d50Y, Z: d50Z } = this.colorConversionUtils.labToD50Xyz(L, a, b);
    const { X, Y, Z } = this.colorConversionUtils.d50XyzToD65Xyz(d50X, d50Y, d50Z);
    const { R: lR, G: lG, B: lB } = this.colorConversionUtils.xyzToLinearRgb(X, Y, Z);
    return this.colorConversionUtils.linearRgbToRgb(lR, lG, lB);
  }

  protected rgbToOklab(R: number, G: number, B: number): { L: number; a: number; b: number } {
    const { R: lR1, G: lG1, B: lB1 } = this.colorConversionUtils.rgbToLinearRgb(R, G, B);
    return this.colorConversionUtils.linearRgbToOklab(lR1, lG1, lB1);
  }

  protected oklabToRgb(L: number, a: number, b: number): { R: number; G: number; B: number } {
    const { R: lR, G: lG, B: lB } = this.colorConversionUtils.oklabToLinearRgb(L, a, b);
    return this.colorConversionUtils.linearRgbToRgb(lR, lG, lB);
  }

  protected rectangularPremultiply(c1: number, c2: number, c3: number, alpha: number): { c1: number; c2: number; c3: number } {
    // given a color in a rectangular orthogonal colorspace
    // and an alpha value
    // return the premultiplied form
    return { c1: c1 * alpha, c2: c2 * alpha, c3: c3 * alpha };
  }

  protected rectangularUnPremultiply(c1: number, c2: number, c3: number, alpha: number): { c1: number; c2: number; c3: number } {
    // given a premultiplied color in a rectangular orthogonal colorspace
    // and an alpha value
    // return the actual color
    if (alpha === 0) {
      return { c1, c2, c3 }; // avoid divide by zero
    }

    return { c1: c1 / alpha, c2: c2 / alpha, c3: c3 / alpha };
  }

  protected polarPremultiply(c1: number, c2: number, alpha: number): { c1: number; c2: number } {
    // given a color in a cylindicalpolar colorspace
    // and an alpha value
    // return the premultiplied form.
    return { c1: c1 * alpha, c2: c2 * alpha };
  }

  protected polarUnPremultiply(c1: number, c2: number, alpha: number): { c1: number; c2: number } {
    // given a color in a cylindicalpolar colorspace
    // and an alpha value
    // return the actual color.
    if (alpha === 0) {
      return { c1, c2 }; // avoid divide by zero
    }

    return { c1: c1 / alpha, c2: c2 / alpha };
  }

  protected mixAlpha(a1: number, a2: number, fraction1: number, fraction2: number): number {
    return a1 * fraction1 + a2 * fraction2;
  }

  protected createColor(A: number, R: number, G: number, B: number): IColor {
    return new Color(A, R, G, B);
  }

  protected getArgs(
    cssColor: string,
    options?: ColorParserOptions,
  ): (
    | {
        colorSpace: RectangularColorSpace;
      }
    | {
        colorSpace: PolarColorSpace;
        hueInterpolationMethod?: HueInterpolationMethod;
      }
  ) & {
    color1: IColor;
    color2: IColor;
    color1Fraction?: number;
    color2Fraction?: number;
  } {
    const funcBodyStartsAt = cssColor.indexOf('(');
    const funcBodyEndsAt = cssColor.lastIndexOf(')');
    const funcBody = cssColor.slice(funcBodyStartsAt + 1, funcBodyEndsAt);

    const args = funcBody
      .replace(/\s{2,}/, ' ')
      .split(',')
      .map((value) => value.trim());

    if (args.length !== 3) {
      throw new Error('Invalid number of color-mix function arguments');
    }

    const [interpolationMethod, color1Args, color2Args] = args;

    const [inConst, colorSpace, hueInterpolationMethod, hueConst] = interpolationMethod.split(' ');

    if (inConst !== 'in') {
      throw new Error('Invalid syntax');
    }

    let interpolationArgs:
      | {
          colorSpace: RectangularColorSpace;
        }
      | {
          colorSpace: PolarColorSpace;
          hueInterpolationMethod?: HueInterpolationMethod;
        };
    if (this.isRectangularColorSpace(colorSpace)) {
      if (hueInterpolationMethod != null) {
        throw new Error('Invalid arguments');
      }

      interpolationArgs = {
        colorSpace,
      };
    } else if (this.isPolarColorSpace(colorSpace)) {
      if (hueInterpolationMethod != null) {
        if (hueConst !== 'hue') {
          throw new Error('Invalid syntax');
        }

        if (!this.isHueInterpolationMethod(hueInterpolationMethod)) {
          throw new Error('Invalid interpolation method');
        }
      }

      interpolationArgs = {
        colorSpace,
        hueInterpolationMethod,
      };
    } else {
      throw new Error('Invalid color space');
    }

    const color1 = this.getColorArgs(color1Args, options);
    const color2 = this.getColorArgs(color2Args, options);

    return {
      ...interpolationArgs,
      color1: color1.color,
      color2: color2.color,
      color1Fraction: color1.fraction,
      color2Fraction: color2.fraction,
    };
  }

  protected getColorArgs(colorArgs: string, options?: ColorParserOptions): { color: IColor; fraction?: number } {
    const [cssColor, fractionPercentage] = colorArgs.split(' ');
    const color = this.cssColorParser.parse(cssColor, options);
    const fraction = fractionPercentage != null ? this.unitParser.parsePercentage(fractionPercentage).value / 100 : undefined;

    return { color, fraction };
  }

  protected isRectangularColorSpace(colorSpace: string): colorSpace is RectangularColorSpace {
    return Object.values<string>(RectangularColorSpace).includes(colorSpace);
  }

  protected isPolarColorSpace(colorSpace: string): colorSpace is PolarColorSpace {
    return Object.values<string>(PolarColorSpace).includes(colorSpace);
  }

  protected isHueInterpolationMethod(hueInterpolationMethod: string): hueInterpolationMethod is HueInterpolationMethod {
    return Object.values<string>(HueInterpolationMethod).includes(hueInterpolationMethod);
  }
}
