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

    this._A = Math.max(0, Math.min(1, A));
    this._R = Math.max(0, Math.min(1, R));
    this._G = Math.max(0, Math.min(1, G));
    this._B = Math.max(0, Math.min(1, B));
  }

  public toHexNumberString(): string {
    return [
      '0x',
      ...[this.to255Range(this.A), this.to255Range(this.R), this.to255Range(this.G), this.to255Range(this.B)].map((value) =>
        value.toString(16).padStart(2, '0').toUpperCase(),
      ),
    ].join('');
  }

  public toHexColorString(): string {
    return [
      '#',
      ...[this.to255Range(this.R), this.to255Range(this.G), this.to255Range(this.B), this.to255Range(this.A)].map((value) =>
        value.toString(16).padStart(2, '0').toUpperCase(),
      ),
    ].join('');
  }

  public toRgbColorString(): string {
    return `rgb(${this.to255Range(this.R)} ${this.to255Range(this.G)} ${this.to255Range(this.B)} / ${round(this.A, 5)})`;
  }

  public toNumber(): number {
    return (
      this.to255Range(this.A) * 2 ** (6 * 4) +
      this.to255Range(this.R) * 2 ** (4 * 4) +
      this.to255Range(this.G) * 2 ** (2 * 4) +
      this.to255Range(this.B)
    );
  }

  protected validate(channel: string, value: number): void {
    if (Number.isNaN(value) === true) {
      throw new Error(`Invalid ${channel} channel value. Channel value must be not NaN`);
    }
  }

  protected to255Range(value: number): number {
    return Math.round(round(value, 5) * 255);
  }
}
