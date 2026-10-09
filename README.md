# integer-clamp-range

Clamps, wraps, and reflects integer values into bounded inclusive ranges. Designed for modular coordinate systems, toroidal grids, and cyclic domains where values must stay within a fixed interval.

## Usage

```js
import { clamp, wrap, reflect } from 'integer-clamp-range';

clamp(15, 0, 10);   // 10  — values past the upper bound are pinned
wrap(13, 0, 6);     // 6   — values cycle around as on a ring
reflect(12, 0, 10);  // 8   — values bounce back off the boundaries
```

## Why this exists

When modelling modular coordinate systems you frequently need to map an unbounded integer into a fixed interval. Three mappings cover the common cases: **clamp** (pin to the nearest bound), **wrap** (treat the range as a ring), and **reflect** (bounce off the walls like a billiard ball). Keeping all three in one small module means consumers don't reach for ad-hoc modulo arithmetic that gets the negative-number case wrong.

The trade-off: inputs are restricted to safe integers. If you need float behaviour, this library will throw rather than guess.

## Edge cases

- **Single-point ranges** (`min === max`): all three functions return `min` for any input. `wrap` and `reflect` special-case this to avoid division by zero.
- **Negative inputs to `wrap`**: uses mathematical modulo, so `wrap(-1, 0, 6) === 6`, not `-1`. This is the behaviour cyclic coordinate systems expect.
- **Non-integer inputs**: rejected with a `TypeError`. The operations are only meaningful for discrete values.
- **Unsafe integers** (beyond ±2^53): rejected with a `TypeError` to prevent silent precision loss.

## Performance

The window keeps a bounded buffer, so `push` is constant time and memory does not
grow with the length of the stream. `peak` and `trough` are linear in the window
size, which is the trade that keeps `push` cheap.

