export function round(value: number, decimalPlaces = 0): number {
  const p = Math.pow(10, decimalPlaces);
  const n = value * p * (1 + Number.EPSILON);
  return Math.round(n) / p;
}
