import { Color } from '../Color';
import { IColor } from '../interfaces/IColor';
import { IColorParser } from '../interfaces/IColorParser';

export class HexColorParser implements IColorParser {
  public parse(cssColor: string): IColor {
    if (cssColor[0] !== '#') {
      throw new Error('Invalid css color');
    }

    if ([4, 5, 7, 9].includes(cssColor.length) === false) {
      throw new Error('Invalid css color');
    }

    for (let i = 1; i < cssColor.length; i++) {
      const charCode = cssColor.charCodeAt(i);
      if (!((charCode >= 48 && charCode <= 57) || (charCode >= 65 && charCode <= 70) || (charCode >= 97 && charCode <= 102))) {
        throw new Error('Invalid css color');
      }
    }

    const hexPart = cssColor.slice(1);

    let R: string;
    let G: string;
    let B: string;
    let A: string | undefined;

    if (hexPart.length === 3 || hexPart.length === 4) {
      R = hexPart.slice(0, 1);
      G = hexPart.slice(1, 2);
      B = hexPart.slice(2, 3);
      if (hexPart.length === 4) {
        A = hexPart.slice(3, 4);
      }
    } else if (hexPart.length === 6 || hexPart.length === 8) {
      R = hexPart.slice(0, 2);
      G = hexPart.slice(2, 4);
      B = hexPart.slice(4, 6);

      if (hexPart.length === 8) {
        A = hexPart.slice(6, 8);
      }
    } else {
      throw new Error('Invalid css hex color');
    }

    if (R.length === 1) {
      R = R.repeat(2);
    }

    if (G.length === 1) {
      G = G.repeat(2);
    }

    if (B.length === 1) {
      B = B.repeat(2);
    }

    if (A == null) {
      A = 'FF';
    }

    if (A.length === 1) {
      A = A.repeat(2);
    }

    return new Color(parseInt(A, 16) / 255, parseInt(R, 16) / 255, parseInt(G, 16) / 255, parseInt(B, 16) / 255);
  }
}
