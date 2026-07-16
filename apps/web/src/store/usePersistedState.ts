import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * usePersistedState<T>
 *
 * A drop-in replacement for React.useState that automatically persists the
 * value to localStorage on every change and restores it on mount.
 *
 * Usage:
 *   const [value, setValue] = usePersistedState('my_key', 'default');
 *
 * Features:
 * - Survives page refresh and navigation
 * - Handles JSON parse errors gracefully (falls back to defaultValue)
 * - Storage failures are silently ignored (no crash)
 * - Works with objects, arrays, strings, numbers, booleans
 */
export function usePersistedState<T>(
  key: string,
  defaultValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const [state, setStateInternal] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return defaultValue;
      return JSON.parse(raw) as T;
    } catch {
      return defaultValue;
    }
  });

  // Track whether we're mounted to avoid setting state on unmounted components
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const setState = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStateInternal((prev) => {
        const next = typeof value === 'function'
          ? (value as (prev: T) => T)(prev)
          : value;
        try {
          localStorage.setItem(key, JSON.stringify(next));
        } catch {
          // localStorage full or unavailable — still update React state
        }
        return next;
      });
    },
    [key]
  );

  const clearPersistedValue = useCallback(() => {
    try {
      localStorage.removeItem(key);
    } catch { /* ignore */ }
    setStateInternal(defaultValue);
  }, [key, defaultValue]);

  // Keep localStorage in sync if the key changes (unlikely but defensive)
  const prevKeyRef = useRef(key);
  useEffect(() => {
    if (prevKeyRef.current !== key) {
      prevKeyRef.current = key;
      try {
        const raw = localStorage.getItem(key);
        if (raw !== null && mountedRef.current) {
          setStateInternal(JSON.parse(raw));
        }
      } catch { /* ignore */ }
    }
  }, [key]);

  return [state, setState, clearPersistedValue];
}

/**
 * usePersistedObject<T>
 *
 * Like usePersistedState but designed for form-like objects.
 * Provides an `update` helper for partial updates (like setState from a class component).
 */
export function usePersistedObject<T extends object>(
  key: string,
  defaultValue: T
): [T, (updates: Partial<T>) => void, () => void] {
  const [state, setState, clear] = usePersistedState<T>(key, defaultValue);

  const update = useCallback((updates: Partial<T>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, [setState]);

  return [state, update, clear];
}
