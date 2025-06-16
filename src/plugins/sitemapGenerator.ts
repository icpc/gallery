import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import type { Plugin } from "vite";

interface SitemapOptions {
  baseUrl: string;
  publicUrl: string;
}

export function sitemapGenerator(options: SitemapOptions): Plugin {
  return {
    name: "sitemap-generator",
    generateBundle() {
      const publicUrl = options.publicUrl;
      const baseUrl = options.baseUrl;
      const dataFolder = process.env.VITE_DATA_FOLDER || "data";
      const dataPath = join(process.cwd(), dataFolder);

      const urls: string[] = [];
      urls.push(`${baseUrl}/${publicUrl}/`);

      // Get years from .event files
      const years = readdirSync(dataPath)
        .filter((file) => file.endsWith(".event"))
        .map((file) => file.replace(".event", ""))
        .sort()
        .reverse();

      for (const year of years) {
        urls.push(`${baseUrl}/${publicUrl}/?album=${encodeURIComponent(year)}`);

        // Add events
        const events = readFileSync(join(dataPath, `${year}.event`), "utf-8")
          .split("\n")
          .filter((line) => line.trim());
        for (const event of events) {
          urls.push(
            `${baseUrl}/${publicUrl}/?album=${encodeURIComponent(year)}&event=${encodeURIComponent(event)}`,
          );
        }

        // Add teams
        const teams = readFileSync(join(dataPath, `${year}.team`), "utf-8")
          .split("\n")
          .filter((line) => line.trim());
        for (const team of teams) {
          urls.push(
            `${baseUrl}/${publicUrl}/?album=${encodeURIComponent(year)}&team=${encodeURIComponent(team)}`,
          );
        }

        // Add people
        const people = readFileSync(join(dataPath, `${year}.people`), "utf-8")
          .split("\n")
          .filter((line) => line.trim());
        for (const person of people) {
          urls.push(
            `${baseUrl}/${publicUrl}/?album=${encodeURIComponent(year)}&person=${encodeURIComponent(person)}`,
          );
        }
      }

      this.emitFile({
        type: "asset",
        fileName: "sitemap.txt",
        source: urls.join("\n"),
      });

      console.log(`✅ Sitemap generated with ${urls.length} URLs`);
    },
  };
}
