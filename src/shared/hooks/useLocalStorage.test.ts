import { beforeEach, describe, expect, it } from "bun:test";
import { readStoredBoolean, writeStoredBoolean } from "./useLocalStorage";

const memoryStorage = new Map<string, string>();

beforeEach(() => {
  memoryStorage.clear();
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      localStorage: {
        getItem: (key: string) => memoryStorage.get(key) ?? null,
        setItem: (key: string, value: string) => {
          memoryStorage.set(key, value);
        },
      },
    },
  });
});

describe("useLocalStorage helpers", () => {
  it("returns fallback when key is unset", () => {
    expect(readStoredBoolean("gallery:infoSidebarOpen", false)).toBe(false);
    expect(readStoredBoolean("gallery:infoSidebarOpen", true)).toBe(true);
  });

  it("persists and reads boolean values accurately", () => {
    writeStoredBoolean("gallery:infoSidebarOpen", true);
    expect(readStoredBoolean("gallery:infoSidebarOpen", false)).toBe(true);

    writeStoredBoolean("gallery:infoSidebarOpen", false);
    expect(readStoredBoolean("gallery:infoSidebarOpen", true)).toBe(false);
  });
});
