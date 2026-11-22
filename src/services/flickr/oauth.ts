import type { FlickrAuthCredentials } from "@/types/gallery";

/**
 * RFC 3986 percent-encoding required by OAuth 1.0a (RFC 5849 §3.6).
 */
export function rfc3986Encode(value: string): string {
  return encodeURIComponent(value).replace(
    /[!'()*]/g,
    (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`,
  );
}

export function buildOAuthSignatureBaseString(
  method: string,
  baseUrl: string,
  params: Record<string, string>,
): string {
  const normalizedParams = Object.entries(params)
    .map(([k, v]) => [rfc3986Encode(k), rfc3986Encode(v)] as const)
    .sort(([kA, vA], [kB, vB]) =>
      kA === kB ? vA.localeCompare(vB) : kA.localeCompare(kB),
    )
    .map(([k, v]) => `${k}=${v}`)
    .join("&");

  return [
    method.toUpperCase(),
    rfc3986Encode(baseUrl),
    rfc3986Encode(normalizedParams),
  ].join("&");
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

export async function signHmacSha1Base64(
  baseString: string,
  consumerSecret: string,
  tokenSecret: string,
): Promise<string> {
  const encoder = new TextEncoder();
  const signingKey = `${rfc3986Encode(consumerSecret)}&${rfc3986Encode(tokenSecret)}`;

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(signingKey),
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    cryptoKey,
    encoder.encode(baseString),
  );
  return bytesToBase64(new Uint8Array(signature));
}

function generateNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export interface SignedRequestOptions {
  nonce?: string;
  timestamp?: string;
}

/**
 * Produces the complete set of RFC 5849 OAuth 1.0a signed parameters
 * (including `oauth_signature`) ready for `application/x-www-form-urlencoded` POST.
 */
export async function signFlickrOAuthParams(
  method: "GET" | "POST",
  baseUrl: string,
  requestParams: Record<string, string>,
  credentials: FlickrAuthCredentials,
  options: SignedRequestOptions = {},
): Promise<Record<string, string>> {
  const params: Record<string, string> = {
    ...requestParams,
    oauth_consumer_key: credentials.apiKey,
    oauth_nonce: options.nonce ?? generateNonce(),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: options.timestamp ?? String(Math.floor(Date.now() / 1000)),
    oauth_token: credentials.oauthToken,
    oauth_version: "1.0",
  };

  const baseString = buildOAuthSignatureBaseString(method, baseUrl, params);
  const signature = await signHmacSha1Base64(
    baseString,
    credentials.apiSecret,
    credentials.oauthTokenSecret,
  );

  return {
    ...params,
    oauth_signature: signature,
  };
}
