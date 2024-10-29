import { CssUnit } from './enums/CssUnit';
import { ICssNumberValue } from './interfaces/ICssNumberValue';

export class CssUnitParser {
  public parsePercentage(value: string): ICssNumberValue {
    if (value.endsWith('%') === false) {
      throw new Error('Invalid CSS unit');
    }

    const valuePart = value.slice(0, -1);

    this.assertValueIsNumberString(valuePart, { allowDecimal: true });

    const valueNumber = parseFloat(valuePart);
    if (isNaN(valueNumber)) {
      throw new Error('Invalid value');
    }

    return { value: valueNumber, unit: CssUnit.Percentage };
  }

  public parseAngle(value: string): ICssNumberValue {
    const units = {
      deg: CssUnit.Degree,
      grad: CssUnit.Gradian,
      rad: CssUnit.Radian,
      turn: CssUnit.Turn,
    };
    const unit = (Object.keys(units) as (keyof typeof units)[]).find((unit) => value.endsWith(unit));
    if (unit == null) {
      throw new Error('Invalid CSS unit');
    }

    const valuePart = value.slice(0, -unit.length);

    this.assertValueIsNumberString(valuePart, { allowDecimal: true });

    const valueNumber = parseFloat(valuePart);
    if (isNaN(valueNumber)) {
      throw new Error('Invalid value');
    }

    return { value: valueNumber, unit: units[unit] };
  }

  public parseDecimal(value: string): number {
    this.assertValueIsNumberString(value, { allowDecimal: true });
    return parseFloat(value);
  }

  protected assertValueIsNumberString(value: string, { allowDecimal }: { allowDecimal?: boolean } = {}): void {
    const numberParts = value.split('.');
    const allowedNumberParts = allowDecimal === true ? 2 : 1;
    if (numberParts.length > allowedNumberParts) {
      throw new Error('Invalid number');
    }

    const number = numberParts.join('');
    for (let i = 0; i < number.length; i++) {
      const charCode = number.charCodeAt(i);
      if (!((charCode >= 48 && charCode <= 57) || (i === 0 && (charCode === 43 || charCode === 45)))) {
        throw new Error('Invalid number');
      }
    }
  }
}
