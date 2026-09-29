/**
 * Core integer range operations: clamp, wrap, reflect.
 *
 * All three operate on inclusive integer ranges [min, max] where min <= max.
 * Non-integer inputs are rejected because the operations are only meaningful
 * for discrete values; applying them to floats would silently produce
 * surprising results (e.g. wrap(2.5, 0, 3) is ambiguous in intent).
 */

/**
 * Assert that a value is a safe integer. Throws TypeError otherwise.
 *
 * We use Number.isSafeInteger rather than Number.isInteger so that the
 * library never silently corrupts values beyond 2^53, where integer
 * arithmetic breaks down in JavaScript.
 */
function assertSafeInteger(value, name) {
  if (!Number.isSafeInteger(value)) {
    throw new TypeError(`${name} must be a safe integer, got ${value}`);
  }
}

/**
 * Assert that [min, max] forms a valid inclusive range.
 */
function assertValidRange(min, max) {
  assertSafeInteger(min, 'min');
  assertSafeInteger(max, 'max');
  if (min > max) {
    throw new RangeError(`min (${min}) must be <= max (${max}))`);
  }
}

/**
 * Clamp an integer into the inclusive range [min, max].
 *
 * Values below min return min; values above max return max; values inside
 * the range pass through unchanged.
 *
 * @param {number} value - Integer to clamp.
 * @param {number} min - Inclusive lower bound.
 * @param {number} max - Inclusive upper bound.
 * @returns {number}
 */
export function clamp(value, min, max) {
  assertValidRange(min, max);
  assertSafeInteger(value, 'value');
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

/**
 * Wrap an integer into the inclusive range [min, max] using modular arithmetic.
 *
 * The range [min, max] is treated as a ring of size (max - min + 1).
 * Values that fall off one end re-enter from the other. This is the right
 * operation for modular coordinate systems, toroidal grids, day-of-week
 * arithmetic, and similar cyclic domains.
 *
 * The implementation uses the mathematical modulo (always non-negative
 * remainder) so that negative inputs wrap correctly: wrap(-1, 0, 6) = 6,
 * not -1.
 *
 * Edge case: when min === max the range has size 1, so every input returns
 * that single value. We special-case this to avoid division by zero.
 *
 * @param {number} value - Integer to wrap.
 * @param {number} min - Inclusive lower bound.
 * @param {number} max - Inclusive upper bound.
 * @returns {number}
 */
export function wrap(value, min, max) {
  assertValidRange(min, max);
  assertSafeInteger(value, 'value');

  const size = max - min + 1;
  if (size === 1) {
    return min;
  }

  // Shift to 0-based, apply mathematical modulo, shift back.
  // The double + size guards against negative intermediate results
  // before the first modulo; a single size is sufficient because
  // value - min is at worst a large negative, and ((x % size) + size)
  // already lands in [0, size). We keep it simple and correct.
  const offset = value - min;
  const mod = ((offset % size) + size) % size;
  return min + mod;
}

/**
 * Reflect an integer into the inclusive range [min, max] by bouncing off the
 * boundaries.
 *
 * Unlike wrap (which treats the range as a ring), reflect treats the range
 * as a segment with walls. A value that overshoots max bounces back toward
 * min, and vice versa. This models physical reflection — a ball hitting a
 * wall — and is useful for ping-pong oscillation and bounded oscillators.
 *
 * The reflection is computed by folding the input into the range using the
 * triangular-wave function. After one round-trip (2 * period) the pattern
 * repeats, so we reduce modulo 2 * period first to keep the fold count
 * small and avoid overflow on very large inputs.
 *
 * Edge case: when min === max every input returns that single value.
 *
 * @param {number} value - Integer to reflect.
 * @param {number} min - Inclusive lower bound.
 * @param {number} max - Inclusive upper bound.
 * @returns {number}
 */
export function reflect(value, min, max) {
  assertValidRange(min, max);
  assertSafeInteger(value, 'value');

  if (min === max) {
    return min;
  }

  const period = max - min;
  const cycle = 2 * period;

  // Reduce value into one cycle relative to min, using mathematical modulo.
  // This keeps the subsequent fold arithmetic within a bounded range and
  // prevents overflow for very large inputs.
  let v = value - min;
  v = ((v % cycle) + cycle) % cycle;

  // Fold: the first half of the cycle [0, period] maps directly to
  // [min, max]; the second half (period, 2*period) folds back from
  // max-1 down to min.
  if (v > period) {
    v = cycle - v;
  }

  return min + v;
}
