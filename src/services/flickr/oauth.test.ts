import { describe, expect, it } from "bun:test";

import {
  buildOAuthSignatureBaseString,
  rfc3986Encode,
  signFlickrOAuthParams,
  signHmacSha1Base64,
} from "@/services/flickr/oauth";

describe("flickrOAuth (RFC 5849)", () => {
  it("percent-encodes RFC 3986 reserved characters including ! ' ( ) *", () => {
    expect(rfc3986Encode("Bill Poucher(1761)!'*")).toBe(
      "Bill%20Poucher%281761%29%21%27%2A",
    );
  });

  it("matches the official RFC 5849 §1.2 / §3.4.2 HMAC-SHA1 test vector", async () => {
    const baseString = buildOAuthSignatureBaseString(
      "GET",
      "http://photos.example.net/photos",
      {
        file: "vacation.jpg",
        oauth_consumer_key: "dpf43f3p2l4k3l03",
        oauth_nonce: "kllo9940pd9333jh",
        oauth_signature_method: "HMAC-SHA1",
        oauth_timestamp: "1191242096",
        oauth_token: "nnch734d00sl2jdk",
        oauth_version: "1.0",
        size: "original",
      },
    );

    expect(baseString).toBe(
      "GET&http%3A%2F%2Fphotos.example.net%2Fphotos&file%3Dvacation.jpg%26oauth_consumer_key%3Ddpf43f3p2l4k3l03%26oauth_nonce%3Dkllo9940pd9333jh%26oauth_signature_method%3DHMAC-SHA1%26oauth_timestamp%3D1191242096%26oauth_token%3Dnnch734d00sl2jdk%26oauth_version%3D1.0%26size%3Doriginal",
    );

    const signature = await signHmacSha1Base64(
      baseString,
      "kd94hf93k423kf44",
      "pfkkdhi9sl3r4s00",
    );
    expect(signature).toBe("tR3+Ty81lMeYAr/Fid0kMTYa/WM=");
  });

  it("produces deterministic signed parameters for Flickr POST requests", async () => {
    const signed = await signFlickrOAuthParams(
      "POST",
      "https://api.flickr.com/services/rest",
      {
        method: "flickr.photos.setTags",
        photo_id: "12345",
        tags: '"event$Photo Tour" "team$MIT"',
        format: "json",
        nojsoncallback: "1",
      },
      {
        apiKey: "consumer-key",
        apiSecret: "consumer-secret",
        oauthToken: "access-token",
        oauthTokenSecret: "access-secret",
      },
      { nonce: "fixed-nonce", timestamp: "1700000000" },
    );

    expect(signed.oauth_consumer_key).toBe("consumer-key");
    expect(signed.oauth_token).toBe("access-token");
    expect(signed.oauth_signature_method).toBe("HMAC-SHA1");
    expect(signed.oauth_version).toBe("1.0");
    expect(signed.oauth_signature).toBeTruthy();
  });
});
