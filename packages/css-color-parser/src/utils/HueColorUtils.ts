import { CssUnitParser } from '../CssUnitParser';
import { CssUnit } from '../enums/CssUnit';
import { normalizeAngle } from './CssUnitUtils';

export class HueColorUtils {
  protected unitParser: CssUnitParser;

  public constructor() {
    this.unitParser = new CssUnitParser();
  }

  public parseHueValue(value: string): number {
    const units = ['deg', 'grad', 'rad', 'turn'];
    if (units.some((unit) => value.endsWith(unit)) === false) {
      value += 'deg';
    }

    const cssValue = this.unitParser.parseAngle(value);
    if (
      cssValue.unit !== CssUnit.Degree &&
      cssValue.unit !== CssUnit.Gradian &&
      cssValue.unit !== CssUnit.Radian &&
      cssValue.unit !== CssUnit.Turn
    ) {
      throw new Error('Invalid hue value');
    }

    return normalizeAngle({ value: cssValue.value, unit: cssValue.unit });
  }

  public parsePercentageValue(value: string): number {
    if (value.endsWith('%') === false) {
      value += '%';
    }

    const cssValue = this.unitParser.parsePercentage(value);
    return cssValue.value;
  }
}
