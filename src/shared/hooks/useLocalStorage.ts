import { useCallback, useState } from "react";

export function readStoredBoolean(key: string, fallback: boolean): boolean {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) {
      return fallback;
    }
    return raw === "true";
  } catch {
    return fallback;
  }
}

export function writeStoredBoolean(key: string, value: boolean): void {
  try {
    window.localStorage.setItem(key, String(value));
  } catch {
    // Ignore storage quota or private-mode restrictions.
  }
}

export function useLocalStorageBoolean(
  key: string,
  defaultValue: boolean,
): [boolean, (next: boolean | ((prev: boolean) => boolean)) => void] {
  const [value, setValue] = useState<boolean>(() =>
    readStoredBoolean(key, defaultValue),
  );

  const setStoredValue = useCallback(
    (next: boolean | ((prev: boolean) => boolean)) => {
      setValue((prev) => {
        const resolved = typeof next === "function" ? next(prev) : next;
        writeStoredBoolean(key, resolved);
        return resolved;
      });
    },
    [key],
  );

  return [value, setStoredValue];
}
