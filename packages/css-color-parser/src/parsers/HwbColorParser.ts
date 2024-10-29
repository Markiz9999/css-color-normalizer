import { ColorConversionUtils } from '../utils/ColorConversionUtils';
import { HueColorUtils } from '../utils/HueColorUtils';
import { SRgbSpaceColorParser } from './SRgbColorSpaceParser';

export class HwbColorParser extends SRgbSpaceColorParser {
  protected hueColorUtils: HueColorUtils;
  protected colorConversionUtils: ColorConversionUtils;

  public constructor() {
    super('hwb');

    this.hueColorUtils = new HueColorUtils();
    this.colorConversionUtils = new ColorConversionUtils();
  }

  protected convertToRgb(args: string[]): { R: number; G: number; B: number } {
    args = args.map((arg) => (arg === 'none' ? '0' : arg));

    const hue = this.hueColorUtils.parseHueValue(args[0]);
    let whiteness = this.hueColorUtils.parsePercentageValue(args[1]) / 100;
    let blackness = this.hueColorUtils.parsePercentageValue(args[2]) / 100;

    const overflow = whiteness + blackness - 1;
    if (overflow > 0) {
      whiteness -= overflow / 2;
      blackness -= overflow / 2;
    }

    const hsv = this.colorConversionUtils.hwbToHsv(hue, whiteness, blackness);

    return this.colorConversionUtils.hsvToRgb(hsv.H, hsv.S, hsv.V);
  }
}
