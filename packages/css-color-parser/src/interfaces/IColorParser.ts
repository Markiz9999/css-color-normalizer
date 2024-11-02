import { IColor } from './IColor';

export interface IColorParser<Options = never> {
  parse(cssColor: string, options?: Options): IColor;
}
