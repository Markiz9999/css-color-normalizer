# css-color-parser

A utility for converting CSS color string into a unified structure.

Demo: https://markiz9999.github.io/css-color-parser/

## Use

```ts
import { CssColorParser } from 'css-color-parser';

const cssColor = 'rgba(100 150 245 / 78%)';

const cssColorNormalizer = new CssColorParser();
const color = cssColorNormalizer.parse(cssColor);

console.log(color.toHexNumberString());
```

## API

This package exports the identifier [`CssColorParser`][api-color-parser].
There is no default export.

### `new CssColorParser().parse(cssColor[, options])`

Parse the CSS color and returns [`IColor`][api-color] structure.

###### Parameters

*   `cssColor` (`string`)
    — CSS color string
*   `options` ([`IColorParseOptions`][api-parse-options], optional)
    — configuration

###### Returns

Unified color ([`IColor`][api-color]).

### `new CssColorParser().isColorSupported(cssColor)`

Returns a `boolean` value representing support for the passed CSS color.

###### Parameters

*   `cssColor` (`string`)
    — CSS color string

###### Returns

Value showing CSS color support (`boolean`).

### `IColorParseOptions`

Configuration (TypeScript type).

###### Fields

*   `mode` ([`ColorParseMode`][api-color-parse-mode], optional)
    — parsing mode for CSS [color scheme](https://developer.mozilla.org/en-US/docs/Web/CSS/color-scheme) dependent color functions

### `IColor`

Configuration (TypeScript type).

###### Fields

*   `A` (`number`)
    — alpha channel in range from 0 to 255
*   `R` (`number`)
    — red channel in range from 0 to 255
*   `G` (`number`)
    — green channel in range from 0 to 255
*   `B` (`number`)
    — blue channel in range from 0 to 255

###### Methods

*   `toHexNumberString` (`() => string`)
    — returns color as a `4bytes` hex number string where the first byte represents the alpha channel, 2 byte the red channel, 3 byte the green channel and 4 byte the blue channel
*   `toHexColorString` (`() => string`)
    — returns the color as HEX CSS color
*   `toRgbColorString` (`() => string`)
    — returns the color as RGB CSS function
*   `toNumber` (`() => number`)
    — returns the color as a `4-byte` number where the 1 byte represents the alpha channel, 2 byte the red channel, 3 byte the green channel and 4 byte the blue channel

### `ColorParseMode`

Configuration (TypeScript type).

###### Values

* `Light`
* `Dark`

[api-color-parser]: #new-csscolorparserparsecsscolor-options

[api-parse-options]: #icolorparseoptions

[api-color]: #icolor

[api-color-parse-mode]: #colorparsemode
