import { useCallback, useEffect, useState } from "react";

import type { FlickrAuthCredentials } from "@/types/gallery";

export const FLICKR_AUTH_STORAGE_KEY = "gallery:flickrAuth";

const listeners = new Set<() => void>();

function notifyListeners(): void {
  for (const listener of listeners) {
    listener();
  }
}

export function isFlickrAuthComplete(
  creds: Partial<FlickrAuthCredentials> | null | undefined,
): creds is FlickrAuthCredentials {
  if (!creds) {
    return false;
  }
  return Boolean(
    creds.apiKey?.trim() &&
      creds.apiSecret?.trim() &&
      creds.oauthToken?.trim() &&
      creds.oauthTokenSecret?.trim(),
  );
}

export function loadFlickrAuth(): FlickrAuthCredentials | null {
  try {
    const raw = window.localStorage.getItem(FLICKR_AUTH_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as Partial<FlickrAuthCredentials>;
    if (!isFlickrAuthComplete(parsed)) {
      return null;
    }
    return {
      apiKey: parsed.apiKey.trim(),
      apiSecret: parsed.apiSecret.trim(),
      oauthToken: parsed.oauthToken.trim(),
      oauthTokenSecret: parsed.oauthTokenSecret.trim(),
    };
  } catch {
    return null;
  }
}

export function saveFlickrAuth(credentials: FlickrAuthCredentials): void {
  const normalized: FlickrAuthCredentials = {
    apiKey: credentials.apiKey.trim(),
    apiSecret: credentials.apiSecret.trim(),
    oauthToken: credentials.oauthToken.trim(),
    oauthTokenSecret: credentials.oauthTokenSecret.trim(),
  };
  try {
    window.localStorage.setItem(
      FLICKR_AUTH_STORAGE_KEY,
      JSON.stringify(normalized),
    );
  } catch {
    // Ignore storage quota or private-mode restrictions.
  }
  notifyListeners();
}

export function clearFlickrAuth(): void {
  try {
    window.localStorage.removeItem(FLICKR_AUTH_STORAGE_KEY);
  } catch {
    // Ignore storage restrictions.
  }
  notifyListeners();
}

export function useFlickrAuth() {
  const [credentials, setCredentials] = useState<FlickrAuthCredentials | null>(
    () => loadFlickrAuth(),
  );

  useEffect(() => {
    const handleChange = () => {
      setCredentials(loadFlickrAuth());
    };
    listeners.add(handleChange);
    window.addEventListener("storage", handleChange);
    return () => {
      listeners.delete(handleChange);
      window.removeEventListener("storage", handleChange);
    };
  }, []);

  const save = useCallback((next: FlickrAuthCredentials) => {
    saveFlickrAuth(next);
  }, []);

  const clear = useCallback(() => {
    clearFlickrAuth();
  }, []);

  return {
    credentials,
    isAuthenticated: credentials !== null,
    save,
    clear,
  };
}
