import { existsSync, readFileSync, readdirSync } from "fs";
import { join } from "path";
import type { Plugin } from "vite";

interface SitemapOptions {
  baseUrl: string;
  publicUrl?: string;
}

function formatUrl(url: string): string {
  url = url.replaceAll(" ", "+");
  return encodeURI(url);
}

function loadDataFile(filePath: string): string[] {
  try {
    if (!existsSync(filePath)) {
      console.warn(`⚠️ Data file not found: ${filePath}`);
      return [];
    }

    return readFileSync(filePath, "utf-8")
      .split("\n")
      .filter((line) => line.trim());
  } catch (error) {
    console.error(`❌ Error reading file ${filePath}:`, error);
    return [];
  }
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

      const websiteRoot = `${baseUrl}${publicUrl ? `/${publicUrl}` : ""}`;

      // Get years from .event files
      const years = readdirSync(dataPath)
        .filter((file) => file.endsWith(".event"))
        .map((file) => file.replace(".event", ""))
        .sort()
        .reverse();

      for (const year of years) {
        urls.push(formatUrl(`${websiteRoot}/?album=${year}`));

        // Add events
        const events = loadDataFile(join(dataPath, `${year}.event`));
        for (const event of events) {
          urls.push(formatUrl(`${websiteRoot}/?album=${year}&event=${event}`));
        }

        // Add teams
        const teams = loadDataFile(join(dataPath, `${year}.team`));
        for (const team of teams) {
          urls.push(formatUrl(`${websiteRoot}/?album=${year}&team=${team}`));
        }

        // Add people
        const people = loadDataFile(join(dataPath, `${year}.people`));
        for (const person of people) {
          urls.push(
            formatUrl(`${websiteRoot}/?album=${year}&person=${person}`),
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
