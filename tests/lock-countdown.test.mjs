import test from 'node:test';
import assert from 'node:assert/strict';
import { LockCountdown, calculateLockRemaining } from '../src/lock-countdown.js';

test('remaining seconds are derived from elapsed wall-clock time', () => {
  assert.equal(calculateLockRemaining(5_000, 0), 5);
  assert.equal(calculateLockRemaining(5_000, 1_000), 4);
  assert.equal(calculateLockRemaining(5_000, 1_999), 4);
  assert.equal(calculateLockRemaining(5_000, 5_000), 0);
});

test('starting twice keeps only one timer and cannot double-decrement', () => {
  let now = 0;
  let nextTimerId = 1;
  const callbacks = new Map();
  const ticks = [];
  let completions = 0;

  const countdown = new LockCountdown({
    now: () => now,
    setIntervalFn: (callback) => {
      const timerId = nextTimerId++;
      callbacks.set(timerId, callback);
      return timerId;
    },
    clearIntervalFn: (timerId) => callbacks.delete(timerId),
  });

  countdown.start(5, { onTick: (remaining) => ticks.push(remaining) });
  const staleCallback = [...callbacks.values()][0];
  countdown.start(5, {
    onTick: (remaining) => ticks.push(remaining),
    onComplete: () => completions++,
  });

  assert.equal(callbacks.size, 1);
  const activeCallback = [...callbacks.values()][0];

  now = 1_000;
  staleCallback();
  activeCallback();
  activeCallback();
  assert.deepEqual(ticks.slice(-2), [4, 4]);

  now = 2_000;
  activeCallback();
  assert.equal(ticks.at(-1), 3);

  now = 5_000;
  activeCallback();
  activeCallback();
  assert.equal(ticks.at(-1), 0);
  assert.equal(completions, 1);
  assert.equal(callbacks.size, 0);
});
