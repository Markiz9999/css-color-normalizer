export interface IColor {
  R: number;
  G: number;
  B: number;
  A: number;

  toHexNumberString(): string;
  toHexColorString(): string;
  toRgbColorString(): string;
  toNumber(): number;
}
