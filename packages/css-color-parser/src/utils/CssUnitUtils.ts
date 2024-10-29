import { CssUnit } from '../enums/CssUnit';
import { ICssNumberValue } from '../interfaces/ICssNumberValue';

export function normalizeAngle(
  cssValue: ICssNumberValue & { unit: CssUnit.Degree | CssUnit.Gradian | CssUnit.Radian | CssUnit.Turn },
): number {
  let degreeValue: number;
  if (cssValue.unit === CssUnit.Degree) {
    degreeValue = cssValue.value;
  } else if (cssValue.unit === CssUnit.Gradian) {
    degreeValue = gradianToDegree(cssValue.value);
  } else if (cssValue.unit === CssUnit.Radian) {
    degreeValue = radianToDegree(cssValue.value);
  } else if (cssValue.unit === CssUnit.Turn) {
    degreeValue = turnToDegree(cssValue.value);
  } else {
    throw new Error('Invalid unit');
  }

  if (degreeValue > 360) {
    degreeValue = degreeValue % 360;
  }

  return degreeValue;
}

export function gradianToDegree(value: number): number {
  return value * 0.9;
}

export function radianToDegree(value: number): number {
  return value * (180 / Math.PI);
}

export function turnToDegree(value: number): number {
  return value * 360;
}
