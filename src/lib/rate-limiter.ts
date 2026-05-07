interface RateLimitState {
  attempts: number;
  lastAttemptTime: number;
  lockedUntil: number;
}

const STORAGE_KEY_PREFIX = "startops_auth_rate_";

const MAX_ATTEMPTS = 5;
const BASE_COOLDOWN_MS = 3000; // 3 seconds
const MAX_COOLDOWN_MS = 60000; // 1 minute max

export class AuthRateLimiter {
  private key: string;

  constructor(action: string) {
    this.key = `${STORAGE_KEY_PREFIX}${action}`;
  }

  private getState(): RateLimitState {
    try {
      const stored = sessionStorage.getItem(this.key);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Ignore parse errors
    }
    return { attempts: 0, lastAttemptTime: 0, lockedUntil: 0 };
  }

  private setState(state: RateLimitState): void {
    try {
      sessionStorage.setItem(this.key, JSON.stringify(state));
    } catch {
      // Ignore storage errors
    }
  }

  /**
   * Check if the action is currently rate-limited.
   * Returns { allowed: false, remainingMs } if locked out.
   */
  check(): { allowed: boolean; remainingMs: number } {
    const state = this.getState();
    const now = Date.now();

    if (state.lockedUntil && now < state.lockedUntil) {
      return { allowed: false, remainingMs: state.lockedUntil - now };
    }

    // Reset if lockout has expired
    if (state.lockedUntil && now >= state.lockedUntil) {
      this.reset();
      return { allowed: true, remainingMs: 0 };
    }

    return { allowed: true, remainingMs: 0 };
  }

  /**
   * Record a failed attempt. Returns the current lockout status.
   */
  recordFailure(): { allowed: boolean; remainingMs: number } {
    const state = this.getState();
    const now = Date.now();

    state.attempts += 1;
    state.lastAttemptTime = now;

    if (state.attempts >= MAX_ATTEMPTS) {
      // Exponential backoff: 3s, 6s, 12s, 24s, 48s, capped at 60s
      const cooldownMs = Math.min(
        BASE_COOLDOWN_MS * Math.pow(2, state.attempts - MAX_ATTEMPTS),
        MAX_COOLDOWN_MS
      );
      state.lockedUntil = now + cooldownMs;
    }

    this.setState(state);
    return this.check();
  }

  /**
   * Record a successful attempt. Resets the counter.
   */
  recordSuccess(): void {
    this.reset();
  }

  /**
   * Reset the rate limiter state.
   */
  reset(): void {
    try {
      sessionStorage.removeItem(this.key);
    } catch {
      // Ignore
    }
  }

  /**
   * Get the number of remaining attempts before lockout.
   */
  getRemainingAttempts(): number {
    const state = this.getState();
    return Math.max(0, MAX_ATTEMPTS - state.attempts);
  }
}

// Pre-configured limiters for common auth actions
export const loginRateLimiter = new AuthRateLimiter("login");
export const signupRateLimiter = new AuthRateLimiter("signup");
export const passwordChangeRateLimiter = new AuthRateLimiter("password_change");