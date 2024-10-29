import { SRgbSpaceColorParser } from './SRgbColorSpaceParser';

export class RgbColorParser extends SRgbSpaceColorParser {
  public constructor() {
    super('rgb');
  }

  protected convertToRgb(args: string[]): { R: number; G: number; B: number } {
    args = args.map((arg) => (arg === 'none' ? '0' : arg));

    return {
      R: this.parseColorChannelValue(args[0]),
      G: this.parseColorChannelValue(args[1]),
      B: this.parseColorChannelValue(args[2]),
    };
  }

  protected parseColorChannelValue(value: string): number {
    let valueNumber: number;

    if (value.endsWith('%')) {
      const cssValue = this.unitParser.parsePercentage(value);
      valueNumber = (cssValue.value / 100) * 255;
    } else {
      valueNumber = this.unitParser.parseDecimal(value);
    }

    return Math.ceil(Math.max(0, Math.min(255, valueNumber)));
  }
}
