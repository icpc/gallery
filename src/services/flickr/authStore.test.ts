import { beforeEach, describe, expect, it } from "bun:test";

import {
  clearFlickrAuth,
  isFlickrAuthComplete,
  loadFlickrAuth,
  saveFlickrAuth,
} from "@/services/flickr/authStore";

describe("flickrAuthStore", () => {
  const store = new Map<string, string>();

  beforeEach(() => {
    store.clear();
    Object.defineProperty(globalThis, "window", {
      value: {
        localStorage: {
          getItem: (key: string) => store.get(key) ?? null,
          setItem: (key: string, value: string) => {
            store.set(key, value);
          },
          removeItem: (key: string) => {
            store.delete(key);
          },
        },
      },
      configurable: true,
    });
  });

  it("saves, trims, loads, and clears Flickr credentials", () => {
    expect(loadFlickrAuth()).toBeNull();

    saveFlickrAuth({
      apiKey: " key1 ",
      apiSecret: " sec1 ",
      oauthToken: " tok1 ",
      oauthTokenSecret: " toksec1 ",
    });

    expect(loadFlickrAuth()).toEqual({
      apiKey: "key1",
      apiSecret: "sec1",
      oauthToken: "tok1",
      oauthTokenSecret: "toksec1",
    });

    clearFlickrAuth();
    expect(loadFlickrAuth()).toBeNull();
  });

  it("validates completeness of credentials", () => {
    expect(
      isFlickrAuthComplete({
        apiKey: "a",
        apiSecret: "b",
        oauthToken: "c",
        oauthTokenSecret: "",
      }),
    ).toBe(false);
    expect(
      isFlickrAuthComplete({
        apiKey: "a",
        apiSecret: "b",
        oauthToken: "c",
        oauthTokenSecret: "d",
      }),
    ).toBe(true);
  });
});
