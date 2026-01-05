import { useState, useCallback, useMemo, useEffect, useRef } from 'react';

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

const getStorageKey = (key: string) => `rate_limit_${key}`;

const getInitialState = (storageKey: string): RateLimitState => {
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore parse errors
  }
  return { attempts: 0, lastAttempt: 0 };
};

/**
 * Custom hook for client-side rate limiting
 * Supports dynamic keys (e.g., per-email rate limiting)
 */
export const useRateLimiting = (key: string, config: RateLimitConfig) => {
  const storageKey = getStorageKey(key);
  const storageKeyRef = useRef(storageKey);
  
  const [state, setState] = useState<RateLimitState>(() => getInitialState(storageKey));

  // Rehydrate state when key changes (e.g., when email changes)
  useEffect(() => {
    if (storageKeyRef.current !== storageKey) {
      storageKeyRef.current = storageKey;
      setState(getInitialState(storageKey));
    }
  }, [storageKey]);

  // Clean up expired state
  useEffect(() => {
    const now = Date.now();
    const windowExpired = state.lastAttempt && (now - state.lastAttempt > config.windowMs);
    const blockExpired = state.blockedUntil && now > state.blockedUntil;
    
    if (windowExpired || blockExpired) {
      const newState: RateLimitState = { attempts: 0, lastAttempt: 0 };
      setState(newState);
      try {
        localStorage.setItem(storageKey, JSON.stringify(newState));
      } catch {
        // Ignore storage errors
      }
    }
  }, [storageKey, config.windowMs, state.lastAttempt, state.blockedUntil]);

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
    const currentStorageKey = storageKeyRef.current;
    
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

      try {
        localStorage.setItem(currentStorageKey, JSON.stringify(newState));
      } catch {
        // Ignore storage errors
      }
      return newState;
    });
  }, [config.windowMs, config.maxAttempts, config.blockDurationMs]);

  const reset = useCallback(() => {
    const currentStorageKey = storageKeyRef.current;
    const newState: RateLimitState = { attempts: 0, lastAttempt: 0 };
    setState(newState);
    try {
      localStorage.setItem(currentStorageKey, JSON.stringify(newState));
    } catch {
      // Ignore storage errors
    }
  }, []);

  const remainingTime = useMemo(() => {
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
    remainingTime,
    attemptsRemaining: Math.max(0, config.maxAttempts - state.attempts),
  };
};
