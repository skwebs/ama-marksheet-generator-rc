import { useState, useEffect } from 'react'

/**
 * useLocalStorage — drop-in replacement for useState that persists
 * the value to localStorage under the given key.
 *
 * @param {string} key          localStorage key
 * @param {*}      initialValue fallback when key is absent or unreadable
 * @returns [value, setValue]   same API as useState
 */
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored !== null ? JSON.parse(stored) : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Storage full or unavailable — silently ignore
    }
  }, [key, value])

  return [value, setValue]
}
