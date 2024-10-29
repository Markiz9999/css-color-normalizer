import { ColorConversionUtils } from '../utils/ColorConversionUtils';
import { HueColorUtils } from '../utils/HueColorUtils';
import { SRgbSpaceColorParser } from './SRgbColorSpaceParser';

export class HslColorParser extends SRgbSpaceColorParser {
  protected hueColorUtils: HueColorUtils;
  protected colorConversionUtils: ColorConversionUtils;

  public constructor() {
    super('hsl');

    this.hueColorUtils = new HueColorUtils();
    this.colorConversionUtils = new ColorConversionUtils();
  }

  protected convertToRgb(args: string[]): { R: number; G: number; B: number } {
    args = args.map((arg) => (arg === 'none' ? '0' : arg));

    const hue = this.hueColorUtils.parseHueValue(args[0]);
    const saturation = this.hueColorUtils.parsePercentageValue(args[1]) / 100;
    const lightness = this.hueColorUtils.parsePercentageValue(args[2]) / 100;

    return this.colorConversionUtils.hslToRgb(hue, saturation, lightness);
  }
}
