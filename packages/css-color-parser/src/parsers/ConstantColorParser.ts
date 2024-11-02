import { Color } from '../Color';
import { CssNamedColors } from '../constants/CssNamedColors';
import { IColor } from '../interfaces/IColor';
import { IColorParser } from '../interfaces/IColorParser';

export class ConstantColorParser implements IColorParser {
  public parse(cssColor: string): IColor {
    cssColor = cssColor.toLowerCase();

    if (!this.isCssNamedColor(cssColor)) {
      throw new Error('Invalid css color');
    }

    const color = CssNamedColors[cssColor];

    return new Color(color.A / 255, color.R / 255, color.G / 255, color.B / 255);
  }

  protected isCssNamedColor(cssColor: string): cssColor is keyof typeof CssNamedColors {
    return cssColor in CssNamedColors;
  }
}
