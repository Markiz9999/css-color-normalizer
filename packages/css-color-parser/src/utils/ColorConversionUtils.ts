// formulas are taken from https://drafts.csswg.org/css-color/#color-conversion-code

import { multiply } from './MatrixUtils';

export class ColorConversionUtils {
  public hslToRgb(H: number, S: number, L: number): { R: number; G: number; B: number } {
    const C = (1 - Math.abs(2 * L - 1)) * S;
    const H1 = H / 60;
    const X = C * (1 - Math.abs((H1 % 2) - 1));

    let R1: number;
    let G1: number;
    let B1: number;
    if (H1 >= 0 && H1 < 1) {
      R1 = C;
      G1 = X;
      B1 = 0;
    } else if (H1 >= 1 && H1 < 2) {
      R1 = X;
      G1 = C;
      B1 = 0;
    } else if (H1 >= 2 && H1 < 3) {
      R1 = 0;
      G1 = C;
      B1 = X;
    } else if (H1 >= 3 && H1 < 4) {
      R1 = 0;
      G1 = X;
      B1 = C;
    } else if (H1 >= 4 && H1 < 5) {
      R1 = X;
      G1 = 0;
      B1 = C;
    } else if (H1 >= 5 && H1 < 6) {
      R1 = C;
      G1 = 0;
      B1 = X;
    } else {
      throw new Error('Unknown error');
    }

    const m = L - C / 2;

    return { R: Math.round((R1 + m) * 255), G: Math.round((G1 + m) * 255), B: Math.round((B1 + m) * 255) };
  }

  public hsvToRgb(H: number, S: number, V: number): { R: number; G: number; B: number } {
    const C = V * S;
    const H1 = H / 60;
    const X = C * (1 - Math.abs((H1 % 2) - 1));

    let R1: number;
    let G1: number;
    let B1: number;
    if (H1 >= 0 && H1 < 1) {
      R1 = C;
      G1 = X;
      B1 = 0;
    } else if (H1 >= 1 && H1 < 2) {
      R1 = X;
      G1 = C;
      B1 = 0;
    } else if (H1 >= 2 && H1 < 3) {
      R1 = 0;
      G1 = C;
      B1 = X;
    } else if (H1 >= 3 && H1 < 4) {
      R1 = 0;
      G1 = X;
      B1 = C;
    } else if (H1 >= 4 && H1 < 5) {
      R1 = X;
      G1 = 0;
      B1 = C;
    } else if (H1 >= 5 && H1 < 6) {
      R1 = C;
      G1 = 0;
      B1 = X;
    } else {
      throw new Error('Unknown error');
    }

    const m = V - C;

    return { R: Math.round((R1 + m) * 255), G: Math.round((G1 + m) * 255), B: Math.round((B1 + m) * 255) };
  }

  public hwbToHsv(H: number, W: number, B: number): { H: number; S: number; V: number } {
    return {
      H,
      S: 1 - W / (1 - B),
      V: 1 - B,
    };
  }

  public oklabToLinearRgb(L: number, a: number, b: number): { R: number; G: number; B: number } {
    const M2_1 = [
      [0.9999999984505195, 0.3963377921737678, 0.21580375806075874],
      [1.0000000088817607, -0.10556134232365633, -0.0638541747717059],
      [1.0000000546724108, -0.08948418209496574, -1.2914855378640917],
    ];
    const M3_1 = [
      [4.076741661347994, -3.3077115904081933, 0.23096992872942795],
      [-1.2684380040921763, 2.6097574006633715, -0.3413193963102196],
      [-0.004196086541837122, -0.7034186144594494, 1.7076147009309446],
    ];

    const [[l1], [m1], [s1]] = multiply(M2_1, [[L], [a], [b]]);
    const [l, m, s] = [Math.pow(l1, 3), Math.pow(m1, 3), Math.pow(s1, 3)];
    const [[R], [G], [B]] = multiply(M3_1, [[l], [m], [s]]);

    return { R, G, B };
  }

  // convert XYZ to linear-light sRGB
  public xyzToLinearRgb(X: number, Y: number, Z: number): { R: number; G: number; B: number } {
    const M = [
      [12831 / 3959, -329 / 214, -1974 / 3959],
      [-851781 / 878810, 1648619 / 878810, 36519 / 878810],
      [705 / 12673, -2585 / 12673, 705 / 667],
    ];

    const [[R], [G], [B]] = multiply(M, [[X], [Y], [Z]]);

    return { R, G, B };
  }

  public oklabToXyz(L: number, a: number, b: number): { X: number; Y: number; Z: number } {
    // Given OKLab, convert to XYZ relative to D65
    const LMStoXYZ = [
      [1.2268798758459243, -0.5578149944602171, 0.2813910456659647],
      [-0.0405757452148008, 1.112286803280317, -0.0717110580655164],
      [-0.0763729366746601, -0.4214933324022432, 1.5869240198367816],
    ];
    const OKLabtoLMS = [
      [1.0, 0.3963377773761749, 0.2158037573099136],
      [1.0, -0.1055613458156586, -0.0638541728258133],
      [1.0, -0.0894841775298119, -1.2914855480194092],
    ];

    const [[l], [m], [s]] = multiply(OKLabtoLMS, [[L], [a], [b]]);
    const [[X], [Y], [Z]] = multiply(LMStoXYZ, [[Math.pow(l, 3)], [Math.pow(m, 3)], [Math.pow(s, 3)]]);

    return { X, Y, Z };
  }

  public linearRgbToRgb(R: number, G: number, B: number): { R: number; G: number; B: number } {
    return { R: this.rgbGammaCorrection(R), G: this.rgbGammaCorrection(G), B: this.rgbGammaCorrection(B) };
  }

  public rgbToLinearRgb(R: number, G: number, B: number): { R: number; G: number; B: number } {
    return { R: this.reversedRgbGammaCorrection(R), G: this.reversedRgbGammaCorrection(G), B: this.reversedRgbGammaCorrection(B) };
  }

  public linearP3ToXyz(lR: number, lG: number, lB: number): { X: number; Y: number; Z: number } {
    // convert an array of linear-light display-p3 values to CIE XYZ
    // using  D65 (no chromatic adaptation)
    // http://www.brucelindbloom.com/index.html?Eqn_RGB_XYZ_Matrix.html
    const M = [
      [608311 / 1250200, 189793 / 714400, 198249 / 1000160],
      [35783 / 156275, 247089 / 357200, 198249 / 2500400],
      [0 / 1, 32229 / 714400, 5220557 / 5000800],
    ];

    const [[X], [Y], [Z]] = multiply(M, [[lR], [lG], [lB]]);

    return { X, Y, Z };
  }

  public a98RgbToLinearA98Rgb(R: number, G: number, B: number): { R: number; G: number; B: number } {
    return { R: this.reversedA98RgbGammaCorrection(R), G: this.reversedA98RgbGammaCorrection(G), B: this.reversedA98RgbGammaCorrection(B) };
  }

  public rec2020ToLinearRec2020(R: number, G: number, B: number): { R: number; G: number; B: number } {
    return {
      R: this.reversedRec2020GammaCorrection(R),
      G: this.reversedRec2020GammaCorrection(G),
      B: this.reversedRec2020GammaCorrection(B),
    };
  }

  public linearA98RgbToXyz(lR: number, lG: number, lB: number): { X: number; Y: number; Z: number } {
    // convert an array of linear-light a98-rgb values to CIE XYZ
    // http://www.brucelindbloom.com/index.html?Eqn_RGB_XYZ_Matrix.html
    // has greater numerical precision than section 4.3.5.3 of
    // https://www.adobe.com/digitalimag/pdfs/AdobeRGB1998.pdf
    // but the values below were calculated from first principles
    // from the chromaticity coordinates of R G B W
    // see matrixmaker.html
    const M = [
      [573536 / 994567, 263643 / 1420810, 187206 / 994567],
      [591459 / 1989134, 6239551 / 9945670, 374412 / 4972835],
      [53769 / 1989134, 351524 / 4972835, 4929758 / 4972835],
    ];

    const [[X], [Y], [Z]] = multiply(M, [[lR], [lG], [lB]]);

    return { X, Y, Z };
  }

  public proPhotoRgbToLinearProPhotoRgb(R: number, G: number, B: number): { R: number; G: number; B: number } {
    return {
      R: this.reversedProPhotoRgbGammaCorrection(R),
      G: this.reversedProPhotoRgbGammaCorrection(G),
      B: this.reversedProPhotoRgbGammaCorrection(B),
    };
  }

  public linearProPhotoToD50Xyz(lR: number, lG: number, lB: number): { X: number; Y: number; Z: number } {
    // convert an array of linear-light prophoto-rgb values to CIE D50 XYZ
    // matrix cannot be expressed in rational form, but is calculated to 64 bit accuracy
    // see https://github.com/w3c/csswg-drafts/issues/7675
    const M = [
      [0.7977666449006423, 0.13518129740053308, 0.0313477341283922],
      [0.2880748288194013, 0.711835234241873, 0.00008993693872564],
      [0, 0, 0.8251046025104602],
    ];

    const [[X], [Y], [Z]] = multiply(M, [[lR], [lG], [lB]]);

    return { X, Y, Z };
  }

  public D50XyzToD65Xyz(fromX: number, fromY: number, fromZ: number): { X: number; Y: number; Z: number } {
    // Bradford chromatic adaptation from D50 to D65
    // See https://github.com/LeaVerou/color.js/pull/360/files
    const M = [
      [0.955473421488075, -0.02309845494876471, 0.06325924320057072],
      [-0.0283697093338637, 1.0099953980813041, 0.021041441191917323],
      [0.012314014864481998, -0.020507649298898964, 1.330365926242124],
    ];

    const [[X], [Y], [Z]] = multiply(M, [[fromX], [fromY], [fromZ]]);

    return { X, Y, Z };
  }

  public linearRec2020ToXyz(R: number, G: number, B: number): { X: number; Y: number; Z: number } {
    // convert an array of linear-light rec2020 values to CIE XYZ
    // using  D65 (no chromatic adaptation)
    // http://www.brucelindbloom.com/index.html?Eqn_RGB_XYZ_Matrix.html
    const M = [
      [63426534 / 99577255, 20160776 / 139408157, 47086771 / 278816314],
      [26158966 / 99577255, 472592308 / 697040785, 8267143 / 139408157],
      [0 / 1, 19567812 / 697040785, 295819943 / 278816314],
    ];
    // 0 is actually calculated as  4.994106574466076e-17

    const [[X], [Y], [Z]] = multiply(M, [[R], [G], [B]]);

    return { X, Y, Z };
  }

  protected rgbGammaCorrection(channelValue: number): number {
    const sign = channelValue < 0 ? -1 : 1;
    const abs = Math.abs(channelValue);

    if (abs > 0.0031308) {
      return sign * (1.055 * Math.pow(abs, 1 / 2.4) - 0.055);
    }

    return 12.92 * channelValue;
  }

  protected reversedRgbGammaCorrection(channelValue: number): number {
    const sign = channelValue < 0 ? -1 : 1;
    const abs = Math.abs(channelValue);

    if (abs <= 0.04045) {
      return channelValue / 12.92;
    }

    return sign * Math.pow((abs + 0.055) / 1.055, 2.4);
  }

  protected reversedA98RgbGammaCorrection(channelValue: number): number {
    const sign = channelValue < 0 ? -1 : 1;
    const abs = Math.abs(channelValue);

    return sign * Math.pow(abs, 563 / 256);
  }

  protected reversedProPhotoRgbGammaCorrection(channelValue: number): number {
    const Et2 = 16 / 512;

    const sign = channelValue < 0 ? -1 : 1;
    const abs = Math.abs(channelValue);

    if (abs <= Et2) {
      return channelValue / 16;
    }

    return sign * Math.pow(abs, 1.8);
  }

  protected reversedRec2020GammaCorrection(channelValue: number): number {
    const alpha = 1.09929682680944;
    const beta = 0.018053968510807;

    const sign = channelValue < 0 ? -1 : 1;
    const abs = Math.abs(channelValue);

    if (abs < beta * 4.5) {
      return channelValue / 4.5;
    }

    return sign * Math.pow((abs + alpha - 1) / alpha, 1 / 0.45);
  }
}
