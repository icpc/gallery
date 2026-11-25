# [ICPC.global](https://icpc.global) Photo Gallery

Static, no-backend React + TypeScript single-page photo gallery backed by the Flickr REST API, powering [news.icpc.global/gallery](https://news.icpc.global/gallery) and regional ICPC galleries.

- [Figma mockups](https://www.figma.com/file/MvNh0jm8dj0LXOh9vsVUbK/ICPC-Live?node-id=0%3A1)
- [Flickr tagging tutorial](https://docs.google.com/document/d/1yBeLEYyGG2FpZGjBmAHP37gJAnKGtA56hAf1XjW8d18/edit#heading=h.iv1qq69p60ub)

## Features

- **No-backend Flickr integration**: fetches albums and metadata directly from the public Flickr REST API with progressive page-1-first loading and persistent `localStorage` caching (`@tanstack/react-query`).
- **Multi-region builds**: one codebase builds 9 regional gallery instances (`data`, `dataNAC`, `dataNERC`, `dataLAC`, `dataAE`, `dataAW`, `dataAP`, `dataEU`, `dataACPC`).
- **Metadata & face tagging**: parses Flickr tags for photographer, album/year, event, team, and face coordinates (`Firstname Lastname(rect64)`), highlighting tagged faces on hover and allowing users to suggest tag/face edits via Gmail, email, or raw tag copy.
- **Responsive fullscreen viewer & slideshow**:
  - **Desktop**: collapsible right-hand Info rail, hover navigation arrows, and full keyboard navigation.
  - **Mobile**: continuous horizontal swipe carousel between photos, pull-up bottom Info sheet attached flush beneath the photo, pull-down on the Info pane to close it, and pull-down on the photo (when Info is closed) to dismiss back to the gallery.
- **Filtering & global search**: filter within any year by event, team, or person, or search by keyword across all years.
- **Build-time SEO**: generates `sitemap.txt` and `robots.txt` for every regional bundle.

## User Guide

All official photos from ICPC World Finals and regional contests are archived here. If you would like to contribute photos, email `lidia@icpc.global`.

### Filtering & Search

- **Year**: Pick a year from the left navigation rail on desktop or the top header menu on mobile. Selecting a year opens `Photo Tour` by default when no other filter is active.
- **Event**: Filter photos within the selected year by event (e.g., `Photo Tour`, `Opening Ceremony`, `Team Photos`, `World Finals`, `Closing Ceremony`).
- **Team**: Pick or type a team name to view all photos tagged with that team in the selected year.
- **People**: Pick or type an individual's name to view their photos in the selected year, or click any person's chip in the photo Info panel to run a global search across all years.
- **Global Search**: Enter any keyword in the Search bar (e.g., `Bill`, `Opening`, `trophy`) to search across all years.

### Photo Viewer Keyboard Shortcuts

| Key | Action |
| --- | --- |
| `←` / `→` | Previous / next photo |
| `Space` | Play / pause slideshow |
| `I` | Toggle Info panel |
| `D` | Download original photo |
| `F` | Open photo on Flickr |
| `E` | Toggle tag & face edit mode |
| `Esc` | Close photo viewer |

*(Letter shortcuts use physical key positions so they work regardless of keyboard layout.)*

## Flickr Tagging Format

All gallery metadata is stored as public Flickr tags:

- **Album (year)**: `album$2001`
- **Event**: `event$Team Photos`
- **Team**: `team$Aalto University`
- **Photographer**: `photographer$Bob Smith`
- **Person (with optional face box)**: `Bill Poucher(1761524d3f579a4d)`

### Picasa Standard Face Tag

The 16 hexadecimal characters inside parentheses encode a 64-bit integer split into four 16-bit unsigned values (`left`, `top`, `right`, `bottom`). Dividing each 16-bit value by `65535` yields normalized coordinates in `[0, 1]`, allowing face overlays to scale accurately at any image size.

### Flickr Tag Notes

- Enclose multi-word or punctuated tags in quotes when entering them manually on Flickr (e.g. `"team$Aalto University"`), otherwise Flickr splits them on spaces.
- Flickr strips spaces and punctuation when matching tags during search; the gallery normalizes tags to match Flickr's behavior.
- Preserve UTF-8 encoding on names so diacritics display consistently.

## Development

### Tech Stack

- **Runtime, package manager & test runner**: [Bun](https://bun.sh)
- **Frontend**: React 19, TypeScript 7 (strict), Material UI (MUI v9) + Emotion, React Router 8
- **Data fetching & caching**: `@tanstack/react-query` + `localStorage` persister
- **Bundler**: Vite 8 (Rolldown)
- **Linting & formatting**: Biome 2.6

### Local Setup & Commands

Requires [Bun](https://bun.sh) installed locally.

```bash
bun install                                                         # Install dependencies
bun run dev                                                         # Local dev server on http://localhost:3000 (uses data/)
bun run check                                                       # Biome lint, format, and import check
bun run check:fix                                                   # Auto-fix Biome issues
bun run typecheck                                                   # Strict TypeScript check (tsc --noEmit)
bun test                                                            # Run unit tests
PUBLIC_URL=gallery VITE_DATA_FOLDER=data bun run build -- --base=/gallery
```

To build a specific regional gallery locally (including a `.zip` archive):

```bash
PUBLIC_URL=galleryNAC VITE_DATA_FOLDER=dataNAC ./build.sh
```

On Windows, `build.bat` builds the selected `PUBLIC_URL` / `VITE_DATA_FOLDER` bundle, and `build-interactive.sh` offers an interactive regional selector.

### Regional Data Configuration

Each regional gallery lives in its own root `data*/` folder (`data`, `dataNAC`, `dataNERC`, `dataLAC`, `dataAE`, `dataAW`, `dataAP`, `dataEU`, `dataACPC`):

- [`data/consts.js`](data/consts.js) defines Flickr credentials/photosets, tag prefixes, suggestion email, and the list of years/places.
- Each year has three newline-delimited list files: `<year>.event`, `<year>.team`, and `<year>.people`.

Offline helper tools for face recognition and tag review live in [`flickr-face-recog/`](flickr-face-recog/) and [`flickr-tag-reviewer/`](flickr-tag-reviewer/).

## CI & Deployment

All workflows live in [`.github/workflows/`](.github/workflows/):

- **CI (`ci.yml`)**: Runs on every push and pull request to `main` — executes `bun run check`, `bun run typecheck`, `bun test`, and verifies the production build.
- **GitHub Pages (`pages.yml`)**: Automatically builds all 9 regional galleries on push to `main` (or manual dispatch), repacks them, and deploys to GitHub Pages.
- **FTP Production Deploy (`publish.yml`)**: Manually triggered (`workflow_dispatch`) to build all 9 regional galleries and deploy them via FTPS to `ftp.u.icpc.global`.
- **Release Bundle (`release.yml`)**: Manually triggered (`workflow_dispatch`) to build and merge all 9 regional galleries into a single downloadable `all` artifact.

## Roadmap / Future Work

- Handle universities renaming across years cleanly
- Standardize legacy event tag names on Flickr for consistency
- Further automate face-recognition and tag-embedding workflows
