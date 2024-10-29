import { IColor } from './interfaces/IColor';
import { round } from './utils/NumberUtils';

export class Color implements IColor {
  protected _A: number;
  protected _R: number;
  protected _G: number;
  protected _B: number;

  public get A(): number {
    return this._A;
  }

  public get R(): number {
    return this._R;
  }

  public get G(): number {
    return this._G;
  }

  public get B(): number {
    return this._B;
  }

  public constructor(A: number, R: number, G: number, B: number) {
    this.validate('A', A);
    this.validate('R', R);
    this.validate('G', G);
    this.validate('B', B);

    this._A = A;
    this._R = R;
    this._G = G;
    this._B = B;
  }

  public toHexNumberString(): string {
    return ['0x', ...[this.A, this.R, this.G, this.B].map((value) => value.toString(16).padStart(2, '0').toUpperCase())].join('');
  }

  public toHexColorString(): string {
    return ['#', ...[this.R, this.G, this.B, this.A].map((value) => value.toString(16).padStart(2, '0').toUpperCase())].join('');
  }

  public toRgbColorString(): string {
    return `rgb(${this.R} ${this.G} ${this.B} / ${round(this.A / 255, 3)})`;
  }

  public toNumber(): number {
    return this.A * 2 ** (6 * 4) + this.R * 2 ** (4 * 4) + this.G * 2 ** (2 * 4) + this.B;
  }

  protected validate(channel: string, value: number): void {
    if (value < 0) {
      throw new Error(`Invalid ${channel} channel value. Negative value is not supported`);
    }

    if (value > 255) {
      throw new Error(`Invalid ${channel} channel value. Maximum channel value is 255`);
    }

    if (Number.isInteger(value) === false) {
      throw new Error(`Invalid ${channel} channel value. Channel value must be integer`);
    }
  }
}
