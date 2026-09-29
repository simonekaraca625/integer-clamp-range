import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { clamp, wrap, reflect } from '../src/index.js';

describe('clamp', () => {
  it('returns the value when inside the range', () => {
    assert.equal(clamp(5, 0, 10), 5);
    assert.equal(clamp(0, 0, 10), 0);
    assert.equal(clamp(10, 0, 10), 10);
  });

  it('returns min when value is below the range', () => {
    assert.equal(clamp(-3, 0, 10), 0);
    assert.equal(clamp(-100, -5, 5), -5);
  });

  it('returns max when value is above the range', () => {
    assert.equal(clamp(15, 0, 10), 10);
    assert.equal(clamp(100, -5, 5), 5);
  });

  it('handles a single-point range', () => {
    assert.equal(clamp(0, 7, 7), 7);
    assert.equal(clamp(100, 7, 7), 7);
    assert.equal(clamp(-100, 7, 7), 7);
  });

  it('rejects non-integer values', () => {
    assert.throws(() => clamp(2.5, 0, 10), TypeError);
    assert.throws(() => clamp(NaN, 0, 10), TypeError);
  });

  it('rejects inverted ranges', () => {
    assert.throws(() => clamp(5, 10, 0), RangeError);
  });
});

describe('wrap', () => {
  it('returns the value when inside the range', () => {
    assert.equal(wrap(3, 0, 6), 3);
    assert.equal(wrap(0, 0, 6), 0);
    assert.equal(wrap(6, 0, 6), 6);
  });

  it('wraps values above max back to min', () => {
    assert.equal(wrap(7, 0, 6), 0);
    assert.equal(wrap(8, 0, 6), 1);
    assert.equal(wrap(13, 0, 6), 6);
  });

  it('wraps negative values using mathematical modulo', () => {
    assert.equal(wrap(-1, 0, 6), 6);
    assert.equal(wrap(-7, 0, 6), 0);
    assert.equal(wrap(-8, 0, 6), 6);
  });

  it('supports non-zero-based ranges', () => {
    assert.equal(wrap(11, 5, 9), 6);
    assert.equal(wrap(4, 5, 9), 9);
    assert.equal(wrap(14, 5, 9), 9);
  });

  it('returns min for every input when the range is a single point', () => {
    assert.equal(wrap(0, 7, 7), 7);
    assert.equal(wrap(100, 7, 7), 7);
    assert.equal(wrap(-50, 7, 7), 7);
  });

  it('rejects non-integer values', () => {
    assert.throws(() => wrap(2.5, 0, 6), TypeError);
  });
});

describe('reflect', () => {
  it('returns the value when inside the range', () => {
    assert.equal(reflect(3, 0, 10), 3);
    assert.equal(reflect(0, 0, 10), 0);
    assert.equal(reflect(10, 0, 10), 10);
  });

  it('reflects values above max back downward', () => {
    assert.equal(reflect(11, 0, 10), 9);
    assert.equal(reflect(12, 0, 10), 8);
    assert.equal(reflect(20, 0, 10), 0);
  });

  it('reflects values below min back upward', () => {
    assert.equal(reflect(-1, 0, 10), 1);
    assert.equal(reflect(-2, 0, 10), 2);
    assert.equal(reflect(-10, 0, 10), 10);
  });

  it('completes a full bounce cycle', () => {
    // Range [0,4], period = 4, cycle = 8.
    // 0->0, 1->1, 2->2, 3->3, 4->4, 5->3, 6->2, 7->1, 8->0, 9->1
    const expected = [0, 1, 2, 3, 4, 3, 2, 1, 0, 1];
    for (let i = 0; i < expected.length; i++) {
      assert.equal(reflect(i, 0, 4), expected[i]);
    }
  });

  it('supports non-zero-based ranges', () => {
    assert.equal(reflect(11, 5, 9), 7);
    assert.equal(reflect(4, 5, 9), 6);
  });

  it('returns min for every input when the range is a single point', () => {
    assert.equal(reflect(0, 7, 7), 7);
    assert.equal(reflect(100, 7, 7), 7);
  });

  it('rejects non-integer values', () => {
    assert.throws(() => reflect(2.5, 0, 10), TypeError);
  });
});
