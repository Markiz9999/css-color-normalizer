import { IColor } from './IColor';

export interface IColorParser<Options = never> {
  isColorSupported(cssColor: string): boolean;
  parse(cssColor: string, options: Options): IColor;
}
