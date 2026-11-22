# AGENTS.md

Guide for coding agents and contributors working on the **ICPC Photo Gallery** repository.

## Overview

A static, no-backend React + TypeScript single-page photo gallery backed by the Flickr REST API. The same codebase builds 9 regional gallery instances (`data`, `dataNAC`, `dataNERC`, `dataLAC`, `dataAE`, `dataAW`, `dataAP`, `dataEU`, `dataACPC`) deployed as static bundles to GitHub Pages and FTP.

## Tech Stack

- **Package manager, script runner, test runner**: Bun (`bun install`, `bun run`, `bun test`)
- **Frontend**: React 19, TypeScript 7 (strict), Material UI (MUI v9) + Emotion, React Router 8
- **Bundler / dev server**: Vite 8 (Rolldown) with `@/*` → `src/*` and `@data/*` → `${VITE_DATA_FOLDER}/*` aliases, plus custom SEO build plugins (`sitemapGenerator`, `robotsTxtGenerator`)
- **Linting & formatting**: Biome 2.6 (`biome.json`) — replaces ESLint and Prettier

## Common Commands

```bash
bun install                                                         # Install dependencies
bun run dev                                                         # Local dev server on port 3000 (defaults to data/)
bun run check                                                       # Biome lint + format + import check
bun run check:fix                                                   # Auto-fix Biome issues
bun run typecheck                                                   # Strict TypeScript check (tsc --noEmit)
bun test                                                            # Run all unit tests
PUBLIC_URL=gallery VITE_DATA_FOLDER=data bun run build -- --base=/gallery
PUBLIC_URL=galleryNAC VITE_DATA_FOLDER=dataNAC bun run build -- --base=/galleryNAC
```

Always run `bun run check`, `bun run typecheck`, `bun test`, and at least one `bun run build` before finishing a task.

## Project Structure

```text
data*/                   Regional gallery configs (`consts.js`) & raw `.event`/`.team`/`.people` lists (kept at root)
flickr-face-recog/       Offline Python face-recognition tooling
flickr-tag-reviewer/     Offline tag-review tooling
src/
  main.tsx               DOM entry point
  app/                   App shell (`App.tsx`, `Providers.tsx`, `theme.ts`)
  config/                Typed Vite wrapper (`gallery.ts`) loading `@data/consts.js` and raw data files
  plugins/               Vite build plugins (`robotsTxtGenerator.ts`, `sitemapGenerator.ts`)
  features/
    gallery/             Photo grid, Flickr loading, URL-synced filter state & navigation
    viewer/              Fullscreen photo viewer, slideshow, face tagging, metadata panel
    navigation/          Header, filter selectors, search bar, year navigation, logo
  services/
    flickr/              Flickr REST client (`api.ts`), tag normalization (`tags.ts`)
  shared/                Domain-agnostic reusable primitives (`ErrorBoundary`, `NotificationProvider`, `useDocumentSeo`, `uniqueList`)
  types/                 Shared TypeScript domain types (`gallery.ts`)
  assets/icons/          SVG icons
  styles/                Global CSS (`global.css`, `theme-variables.css`)
```

### Module Boundaries
- Co-locate feature-specific components, hooks, state, utils, CSS, and `*.test.ts` files inside `src/features/<feature>/`.
- Keep `src/shared/` strictly domain-agnostic (no imports from `features/`, `services/`, or `config/`).
- Keep pure logic modules (anything tested by `bun test`) free of `@/config/gallery` imports, because `src/config/gallery.ts` uses Vite-only `import.meta.glob`. Pass config values/prefixes as parameters instead (see `photoTagParser.ts` vs `photoTags.ts`).

## Key Architectural Invariants

1. **Regional `data*/` folders stay at repo root in plain JS/text**: External data scripts and GitHub Actions matrices (`pages.yml`, `publish.yml`, `release.yml`) depend on `VITE_DATA_FOLDER=data*` with `consts.js` and `<year>.{event,team,people}`. Type them via `src/vite-env.d.ts` and `src/config/gallery.ts`; do not convert `data*/` to TypeScript.
2. **Preserve build-time SEO generation**: `vite.config.ts` runs `sitemapGenerator` and `robotsTxtGenerator` on every regional build to emit `sitemap.txt` and `robots.txt`.

## Coding Conventions

- **TypeScript**: Strict mode with `noUncheckedIndexedAccess`, `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`. Never use `any` or non-null assertions (`!`).
- **MUI v9**:
  - Pass layout/spacing styles via `sx={{ ... }}` (direct system props like `mt`, `display`, `height` on `Box`/`Stack`/`Grid` are removed in MUI v9).
  - Use `<Grid size={...}>` (not `<Grid item xs={...}>`).
  - Use `slotProps` instead of deprecated `InputProps` / `PaperProps`.
  - Outlined icons use the `*Outlined` suffix (e.g. `DeleteOutlined`, `CheckCircleOutlined`).
- **Testing**: Add or update `bun:test` unit tests alongside pure domain, tag normalization, URL, caching, and navigation logic.
