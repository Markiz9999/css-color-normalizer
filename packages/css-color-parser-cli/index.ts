/* eslint-disable no-console */

import { CssColorParser } from 'css-color-parser';

const cssColor = process.argv.slice(2)[0];

const cssColorNormalizer = new CssColorParser();
const color = cssColorNormalizer.parse(cssColor);

console.log(color.toHexNumberString());
