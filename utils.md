# @basementuniverse/utils library

This file provides a concise, complete summary of the `@basementuniverse/utils` JavaScript library for AI/LLM code generation. Include this as context for best results.

## Overview

Stateless, pure utility functions for math, random, array, and object operations. All functions are exported as named CommonJS exports.

## Usage

```js
const utils = require('@basementuniverse/utils');
// or: const { clamp, range, ... } = require('@basementuniverse/utils');
```

## Function Reference

### Math & Number

- `memoize(f)` – Memoize a function.
- `floatEquals(a, b, [p])` – Approximate float equality.
- `clamp(a, [min], [max])` – Clamp number to range.
- `frac(a)` – Fractional part of a number.
- `round(n, [d])` – Round to d decimals.
- `lerp(a, b, i)` – Linear interpolation.
- `unlerp(a, b, i)` – Inverse lerp.
- `blerp(c00, c10, c01, c11, ix, iy)` – Bilinear interpolation.
- `remap(i, a1, a2, b1, b2)` – Remap number between ranges.
- `smoothstep(a, b, i)` – Smooth interpolation.
- `radians(deg)` / `degrees(rad)` – Convert angle units.

### Random

- `randomBetween(min, max)` – Random float [min, max).
- `randomIntBetween(min, max)` – Random int [min, max].
- `cltRandom([mu], [sigma], [samples])` – Normal random float.
- `cltRandomInt(min, max)` – Normal random int.
- `weightedRandom(w)` – Weighted random index.

### Array & Vector

- `lerpArray(a, i, [f])` – Interpolate array.
- `dot(a, b)` – Dot product.
- `permutations(a, r)` – All r-length permutations.
- `combinations(a, r)` – All r-length combinations.
- `cartesian(...arr)` – Cartesian product.
- `times(f, n)` – Array of n values via f(i).
- `range(n)` – `[0, 1, ..., n-1]`.
- `zip(...a)` – Zip arrays.
- `at(a, i)` – Array access with wrapping.
- `peek(a)` – Last element.
- `ind(x, y, w)` / `pos(i, w)` – 2D <-> 1D index/pos.
- `chunk(a, n)` – Split array into chunks.
- `shuffle(a)` – Shallow random shuffle.

### Object

- `flat(o, [sep])` – Flatten object.
- `unflat(o, [sep])` – Unflatten object.
- `split(array, pred)` – Split array by predicate.
- `pluck(o, ...keys)` – Pick keys from object.
- `exclude(o, ...keys)` – Exclude keys from object.
- `transform(o, [keyFn], [valFn])` – Recursively transform object keys/values.

### Combinatorics

- `factorial(a)` – a! (factorial).
- `npr(n, r)` – Permutations count.
- `ncr(n, r)` – Combinations count.

## Notes

- All functions are pure and have no side effects.
- No dependencies. Works in Node.js and browser (with bundler).

---
For full JSDoc and examples, see `utils.js`.
