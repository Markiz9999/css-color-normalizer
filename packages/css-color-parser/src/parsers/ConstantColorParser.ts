import { Color } from '../Color';
import { CssNamedColors } from '../constants/CssNamedColors';
import { IColor } from '../interfaces/IColor';
import { IColorParser } from '../interfaces/IColorParser';

export class ConstantColorParser implements IColorParser {
  public isColorSupported(cssColor: string): cssColor is keyof typeof CssNamedColors {
    cssColor = cssColor.toLowerCase();
    return this.tryGetColor(cssColor) != null;
  }

  public parse(cssColor: string): IColor {
    const color = this.tryGetColor(cssColor);

    if (color == null) {
      throw new Error('Invalid css color');
    }

    return new Color(color.A, color.R, color.G, color.B);
  }

  protected tryGetColor(cssColor: string): { A: number; R: number; G: number; B: number } | null {
    cssColor = cssColor.toLowerCase();
    return cssColor in CssNamedColors ? CssNamedColors[cssColor as keyof typeof CssNamedColors] : null;
  }
}
