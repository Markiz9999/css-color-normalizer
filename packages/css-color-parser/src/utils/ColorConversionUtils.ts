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

    return { R: R1 + m, G: G1 + m, B: B1 + m };
  }

  public rgbToHsl(R: number, G: number, B: number): { H: number; S: number; L: number } {
    const max = Math.max(R, G, B);
    const min = Math.min(R, G, B);

    let H = NaN;
    let S = 0;
    const L = (min + max) / 2;

    const d = max - min;

    if (d !== 0) {
      S = L === 0 || L === 1 ? 0 : (max - L) / Math.min(L, 1 - L);

      switch (max) {
        case R:
          H = (G - B) / d + (G < B ? 6 : 0);
          break;
        case G:
          H = (B - R) / d + 2;
          break;
        case B:
          H = (R - G) / d + 4;
      }

      H = H * 60;
    }

    // Very out of gamut colors can produce negative saturation
    // If so, just rotate the hue by 180 and use a positive saturation
    // see https://github.com/w3c/csswg-drafts/issues/9222
    if (S < 0) {
      H += 180;
      S = Math.abs(S);
    }

    if (H >= 360) {
      H -= 360;
    }

    return { H, S, L };
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

    return { R: R1 + m, G: G1 + m, B: B1 + m };
  }

  public hwbToHsv(H: number, W: number, B: number): { H: number; S: number; V: number } {
    return {
      H,
      S: 1 - W / (1 - B),
      V: 1 - B,
    };
  }

  public rgbToHue(R: number, G: number, B: number): number {
    // Similar to rgbToHsl, except that saturation and lightness are not calculated, and
    // potential negative saturation is ignored.
    const max = Math.max(R, G, B);
    const min = Math.min(R, G, B);
    let hue = NaN;
    const d = max - min;

    if (d !== 0) {
      switch (max) {
        case R:
          hue = (G - B) / d + (G < B ? 6 : 0);
          break;
        case G:
          hue = (B - R) / d + 2;
          break;
        case B:
          hue = (R - G) / d + 4;
      }

      hue *= 60;
    }

    if (hue >= 360) {
      hue -= 360;
    }

    return hue;
  }

  public rgbToHwb(R: number, G: number, B: number): { H: number; W: number; B: number } {
    const hue = this.rgbToHue(R, G, B);
    const white = Math.min(R, G, B);
    const black = 1 - Math.max(R, G, B);
    return { H: hue, W: white, B: black };
  }

  public d50XyzToLab(X: number, Y: number, Z: number): { L: number; a: number; b: number } {
    // Assuming XYZ is relative to D65, convert to CIE Lab
    // from CIE standard, which now defines these as a rational fraction

    const D50 = [0.3457 / 0.3585, 1.0, (1.0 - 0.3457 - 0.3585) / 0.3585];
    // const D65 = [0.3127 / 0.329, 1.0, (1.0 - 0.3127 - 0.329) / 0.329];

    const ε = 216 / 24389; // 6^3 / 29^3
    const κ = 24389 / 27; // 29^3 / 3^3

    // compute xyz, which is XYZ scaled relative to reference white
    const X1 = X / D50[0];
    const Y1 = Y / D50[1];
    const Z1 = Z / D50[2];

    // now compute f
    const f1 = X1 > ε ? Math.cbrt(X1) : (κ * X1 + 16) / 116;
    const f2 = Y1 > ε ? Math.cbrt(Y1) : (κ * Y1 + 16) / 116;
    const f3 = Z1 > ε ? Math.cbrt(Z1) : (κ * Z1 + 16) / 116;

    return { L: 116 * f2 - 16, a: 500 * (f1 - f2), b: 200 * (f2 - f3) };
  }

  public labToD50Xyz(L: number, a: number, b: number): { X: number; Y: number; Z: number } {
    // Convert Lab to D65-adapted XYZ
    // http://www.brucelindbloom.com/index.html?Eqn_RGB_XYZ_Matrix.html

    const D50 = [0.3457 / 0.3585, 1.0, (1.0 - 0.3457 - 0.3585) / 0.3585];
    // const D65 = [0.3127 / 0.329, 1.0, (1.0 - 0.3127 - 0.329) / 0.329];

    const κ = 24389 / 27; // 29^3 / 3^3
    const ε = 216 / 24389; // 6^3 / 29^3

    // compute f, starting with the luminance-related term
    const f2 = (L + 16) / 116;
    const f1 = a / 500 + f2;
    const f3 = f2 - b / 200;

    // compute xyz
    const X = Math.pow(f1, 3) > ε ? Math.pow(f1, 3) : (116 * f1 - 16) / κ;
    const Y = L > κ * ε ? Math.pow((L + 16) / 116, 3) : L / κ;
    const Z = Math.pow(f3, 3) > ε ? Math.pow(f3, 3) : (116 * f3 - 16) / κ;

    // Compute XYZ by scaling xyz by reference white
    return { X: X * D50[0], Y: Y * D50[1], Z: Z * D50[2] };
  }

  public labToLch(L: number, a: number, b: number): { L: number; C: number; H: number } {
    // Convert to polar form
    const hue = (Math.atan2(b, a) * 180) / Math.PI;
    return {
      L, // L is still L
      C: Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2)), // Chroma
      H: hue >= 0 ? hue : hue + 360, // Hue, in degrees [0 to 360)
    };
  }

  public lchToLab(L: number, C: number, H: number): { L: number; a: number; b: number } {
    // Convert from polar form
    return {
      L, // L is still L
      a: C * Math.cos((H * Math.PI) / 180), // a
      b: C * Math.sin((H * Math.PI) / 180), // b
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

  public oklabToXyz(L: number, a: number, b: number): { X: number; Y: number; Z: number } {
    if (L < 0.000001) {
      L = 0;
      a = 0;
      b = 0;
    }

    if (L > 0.999999) {
      L = 1;
      a = 0;
      b = 0;
    }

    // Given OKLab, convert to XYZ relative to D65
    const M1_1 = [
      [1.2268798758459243, -0.5578149944602171, 0.2813910456659647],
      [-0.0405757452148008, 1.112286803280317, -0.0717110580655164],
      [-0.0763729366746601, -0.4214933324022432, 1.5869240198367816],
    ];
    const M2_1 = [
      [1.0, 0.3963377773761749, 0.2158037573099136],
      [1.0, -0.1055613458156586, -0.0638541728258133],
      [1.0, -0.0894841775298119, -1.2914855480194092],
    ];

    const [[l], [m], [s]] = multiply(M2_1, [[L], [a], [b]]);
    const [l1, m1, s1] = [Math.pow(l, 3), Math.pow(m, 3), Math.pow(s, 3)];
    const [[X], [Y], [Z]] = multiply(M1_1, [[l1], [m1], [s1]]);

    return { X, Y, Z };
  }

  public linearRgbToOklab(R: number, G: number, B: number): { L: number; a: number; b: number } {
    const M2 = [
      [0.2104542553, 0.793617785, -0.0040720468],
      [1.9779984951, -2.428592205, 0.4505937099],
      [0.0259040371, 0.7827717662, -0.808675766],
    ];
    const M3 = [
      [0.4122214708, 0.5363325363, 0.0514459929],
      [0.2119034982, 0.6806995451, 0.1073969566],
      [0.0883024619, 0.2817188376, 0.6299787005],
    ];

    const [[l], [m], [s]] = multiply(M3, [[R], [G], [B]]);
    const [l1, m1, s1] = [Math.cbrt(l), Math.cbrt(m), Math.cbrt(s)];
    const [[L], [a], [b]] = multiply(M2, [[l1], [m1], [s1]]);

    return { L, a, b };
  }

  public oklabToOklch(L: number, a: number, b: number): { L: number; C: number; H: number } {
    const hue = (Math.atan2(b, a) * 180) / Math.PI;
    return {
      L, // L is still L
      C: Math.sqrt(a ** 2 + b ** 2), // Chroma
      H: hue >= 0 ? hue : hue + 360, // Hue, in degrees [0 to 360)
    };
  }

  public oklchToOklab(L: number, C: number, H: number): { L: number; a: number; b: number } {
    return {
      L, // L is still L
      a: C * Math.cos((H * Math.PI) / 180), // a
      b: C * Math.sin((H * Math.PI) / 180), // b
    };
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

  public linearRgbToXyz(R: number, G: number, B: number): { X: number; Y: number; Z: number } {
    // convert an array of linear-light sRGB values to CIE XYZ
    // using sRGB's own white, D65 (no chromatic adaptation)

    const M = [
      [506752 / 1228815, 87881 / 245763, 12673 / 70218],
      [87098 / 409605, 175762 / 245763, 12673 / 175545],
      [7918 / 409605, 87881 / 737289, 1001167 / 1053270],
    ];

    const [[X], [Y], [Z]] = multiply(M, [[R], [G], [B]]);

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

  public xyzToLinearP3(X: number, Y: number, Z: number): { R: number; G: number; B: number } {
    // convert XYZ to linear-light P3
    const M = [
      [446124 / 178915, -333277 / 357830, -72051 / 178915],
      [-14852 / 17905, 63121 / 35810, 423 / 17905],
      [11844 / 330415, -50337 / 660830, 316169 / 330415],
    ];

    const [[R], [G], [B]] = multiply(M, [[X], [Y], [Z]]);

    return { R, G, B };
  }

  public linearA98RgbToA98Rgb(R: number, G: number, B: number): { R: number; G: number; B: number } {
    return {
      R: this.a98RgbGammaCorrection(R),
      G: this.a98RgbGammaCorrection(G),
      B: this.a98RgbGammaCorrection(B),
    };
  }

  public a98RgbToLinearA98Rgb(R: number, G: number, B: number): { R: number; G: number; B: number } {
    return { R: this.reversedA98RgbGammaCorrection(R), G: this.reversedA98RgbGammaCorrection(G), B: this.reversedA98RgbGammaCorrection(B) };
  }

  public linearRec2020ToRec2020(R: number, G: number, B: number): { R: number; G: number; B: number } {
    return {
      R: this.rec2020GammaCorrection(R),
      G: this.rec2020GammaCorrection(G),
      B: this.rec2020GammaCorrection(B),
    };
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

  public xyzToLinearA98Rgb(X: number, Y: number, Z: number): { R: number; G: number; B: number } {
    // convert XYZ to linear-light a98-rgb
    const M = [
      [1829569 / 896150, -506331 / 896150, -308931 / 896150],
      [-851781 / 878810, 1648619 / 878810, 36519 / 878810],
      [16779 / 1248040, -147721 / 1248040, 1266979 / 1248040],
    ];

    const [[R], [G], [B]] = multiply(M, [[X], [Y], [Z]]);

    return { R, G, B };
  }

  public linearProPhotoRgbToProPhotoRgb(R: number, G: number, B: number): { R: number; G: number; B: number } {
    return {
      R: this.proPhotoRgbGammaCorrection(R),
      G: this.proPhotoRgbGammaCorrection(G),
      B: this.proPhotoRgbGammaCorrection(B),
    };
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

  public d50XyzToLinearProPhoto(X: number, Y: number, Z: number): { R: number; G: number; B: number } {
    // convert D50 XYZ to linear-light prophoto-rgb
    const M = [
      [1.3457868816471583, -0.25557208737979464, -0.05110186497554526],
      [-0.5446307051249019, 1.5082477428451468, 0.02052744743642139],
      [0.0, 0.0, 1.2119675456389452],
    ];

    const [[R], [G], [B]] = multiply(M, [[X], [Y], [Z]]);

    return { R, G, B };
  }

  public d50XyzToD65Xyz(fromX: number, fromY: number, fromZ: number): { X: number; Y: number; Z: number } {
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

  public d65XyzToD50Xyz(fromX: number, fromY: number, fromZ: number): { X: number; Y: number; Z: number } {
    // Bradford chromatic adaptation from D65 to D50
    // The matrix below is the result of three operations:
    // - convert from XYZ to retinal cone domain
    // - scale components from one reference white to another
    // - convert back to XYZ
    // see https://github.com/LeaVerou/color.js/pull/354/files

    const M = [
      [1.0479297925449969, 0.022946870601609652, -0.05019226628920524],
      [0.02962780877005599, 0.9904344267538799, -0.017073799063418826],
      [-0.009243040646204504, 0.015055191490298152, 0.7518742814281371],
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

  public xyzToLinearRec2020(X: number, Y: number, Z: number): { R: number; G: number; B: number } {
    // convert XYZ to linear-light rec2020
    const M = [
      [30757411 / 17917100, -6372589 / 17917100, -4539589 / 17917100],
      [-19765991 / 29648200, 47925759 / 29648200, 467509 / 29648200],
      [792561 / 44930125, -1921689 / 44930125, 42328811 / 44930125],
    ];

    const [[R], [G], [B]] = multiply(M, [[X], [Y], [Z]]);

    return { R, G, B };
  }

  protected rgbGammaCorrection(channelValue: number): number {
    const sign = channelValue < 0 ? -1 : 1;
    const abs = Math.abs(channelValue);

    if (abs > 0.0031308) {
      return sign * (1.055 * Math.pow(abs, 1 / 2.4) - 0.055);
    }

    return 12.92 * channelValue;
  }

  protected a98RgbGammaCorrection(channelValue: number): number {
    const sign = channelValue < 0 ? -1 : 1;
    const abs = Math.abs(channelValue);

    return sign * Math.pow(abs, 256 / 563);
  }

  protected proPhotoRgbGammaCorrection(channelValue: number): number {
    const Et = 1 / 512;
    const sign = channelValue < 0 ? -1 : 1;
    const abs = Math.abs(channelValue);

    if (abs >= Et) {
      return sign * Math.pow(abs, 1 / 1.8);
    }

    return 16 * channelValue;
  }

  protected rec2020GammaCorrection(channelValue: number): number {
    const alpha = 1.09929682680944;
    const beta = 0.018053968510807;

    const sign = channelValue < 0 ? -1 : 1;
    const abs = Math.abs(channelValue);

    if (abs > beta) {
      return sign * (alpha * Math.pow(abs, 0.45) - (alpha - 1));
    }

    return 4.5 * channelValue;
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
