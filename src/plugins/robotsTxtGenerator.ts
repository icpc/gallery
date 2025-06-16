import type { Plugin } from "vite";

interface RobotsOptions {
  baseUrl: string;
  publicUrl: string;
}

export function robotsTxtGenerator(options: RobotsOptions): Plugin {
  return {
    name: "robots-txt-generator",
    generateBundle() {
      const publicUrl = options.publicUrl;
      const baseUrl = options.baseUrl;

      const robotsTxt = `
        User-agent: *
        Allow: /

        Sitemap: ${baseUrl}/${publicUrl}/sitemap.txt`;

      this.emitFile({
        type: "asset",
        fileName: "robots.txt",
        source: robotsTxt,
      });

      console.log("✅ robots.txt generated");
    },
  };
}
