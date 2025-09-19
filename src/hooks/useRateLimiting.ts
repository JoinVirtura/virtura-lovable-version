import { useState, useCallback, useMemo } from 'react';

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  blockDurationMs?: number;
}

interface RateLimitState {
  attempts: number;
  lastAttempt: number;
  blockedUntil?: number;
}

/**
 * Custom hook for client-side rate limiting
 * Useful for preventing rapid-fire requests and brute force attempts
 */
export const useRateLimiting = (key: string, config: RateLimitConfig) => {
  const [state, setState] = useState<RateLimitState>(() => {
    const stored = localStorage.getItem(`rate_limit_${key}`);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return { attempts: 0, lastAttempt: 0 };
      }
    }
    return { attempts: 0, lastAttempt: 0 };
  });

  const isBlocked = useMemo(() => {
    const now = Date.now();
    
    // Check if currently blocked
    if (state.blockedUntil && now < state.blockedUntil) {
      return true;
    }

    // Check if max attempts reached in current window
    if (now - state.lastAttempt <= config.windowMs && state.attempts >= config.maxAttempts) {
      return true;
    }

    return false;
  }, [state, config]);

  const recordAttempt = useCallback(() => {
    const now = Date.now();
    
    setState(prev => {
      // Reset attempts if window has passed
      const currentAttempts = now - prev.lastAttempt > config.windowMs ? 0 : prev.attempts;
      
      const newState: RateLimitState = {
        attempts: currentAttempts + 1,
        lastAttempt: now,
      };

      // If max attempts reached, set block duration
      if (newState.attempts >= config.maxAttempts && config.blockDurationMs) {
        newState.blockedUntil = now + config.blockDurationMs;
      }

      localStorage.setItem(`rate_limit_${key}`, JSON.stringify(newState));
      return newState;
    });
  }, [config, key]);

  const reset = useCallback(() => {
    const newState: RateLimitState = { attempts: 0, lastAttempt: 0 };
    setState(newState);
    localStorage.setItem(`rate_limit_${key}`, JSON.stringify(newState));
  }, [key]);

  const getRemainingTime = useCallback(() => {
    if (state.blockedUntil) {
      const remaining = state.blockedUntil - Date.now();
      return remaining > 0 ? remaining : 0;
    }
    return 0;
  }, [state.blockedUntil]);

  return {
    isBlocked,
    recordAttempt,
    reset,
    remainingTime: getRemainingTime(),
    attemptsRemaining: Math.max(0, config.maxAttempts - state.attempts),
  };
};