/**
 * @fileoverview Custom hook for persistent localStorage state.
 * Drop-in replacement for useState with automatic persistence.
 * @module hooks/useLocalStorage
 */

import { useState, useCallback } from 'react';

/**
 * A useState-like hook that persists state to localStorage.
 * @param {string} key - LocalStorage key.
 * @param {*} initialValue - Default value if key doesn't exist.
 * @returns {[*, Function]} Tuple of [storedValue, setValue].
 */
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`[useLocalStorage] Error reading key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error(`[useLocalStorage] Error setting key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue];
}

export default useLocalStorage;
