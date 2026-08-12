export function calculateLockRemaining(endsAt, now = Date.now()) {
  return Math.max(0, Math.ceil((endsAt - now) / 1000));
}

export class LockCountdown {
  constructor({
    now = () => Date.now(),
    setIntervalFn = (callback, delay) => globalThis.setInterval(callback, delay),
    clearIntervalFn = (timerId) => globalThis.clearInterval(timerId),
  } = {}) {
    this.now = now;
    this.setIntervalFn = setIntervalFn;
    this.clearIntervalFn = clearIntervalFn;
    this.current = null;
  }

  start(durationSeconds, { onTick = () => {}, onComplete = () => {} } = {}) {
    this.stop();

    const safeDuration = Math.max(0, Number(durationSeconds) || 0);
    const endsAt = this.now() + safeDuration * 1000;
    const token = Symbol('lock-countdown');
    let completed = false;

    const tick = () => {
      if (!this.current || this.current.token !== token) return;

      const remaining = calculateLockRemaining(endsAt, this.now());
      onTick(remaining, endsAt);

      if (remaining <= 0 && !completed) {
        completed = true;
        this.stop();
        onComplete();
      }
    };

    const timerId = this.setIntervalFn(tick, 200);
    this.current = { timerId, endsAt, token };
    tick();
    return endsAt;
  }

  stop() {
    if (this.current !== null) {
      this.clearIntervalFn(this.current.timerId);
      this.current = null;
    }
  }
}
