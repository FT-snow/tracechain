class RateLimiter {
  private queue: (() => void)[] = [];
  private running = 0;
  constructor(private maxPerSec: number) {}
  async acquire() {
    return new Promise<void>((resolve) => {
      if (this.running < this.maxPerSec) {
        this.running++;
        setTimeout(() => {
          this.running--;
          if (this.queue.length) this.queue.shift()?.();
        }, 1000);
        resolve();
      } else {
        this.queue.push(() => {
          this.running++;
          setTimeout(() => {
            this.running--;
            if (this.queue.length) this.queue.shift()?.();
          }, 1000);
          resolve();
        });
      }
    });
  }
}

export const etherscanLimiter = new RateLimiter(5);
export const blockchairLimiter = new RateLimiter(3);
export const tronscanLimiter = new RateLimiter(5);
