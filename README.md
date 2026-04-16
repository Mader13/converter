# Minti Converter

Static React application for converting and resizing images fully in the browser. It is built for privacy-first usage: PNG, JPEG, and WebP files are processed locally with Canvas APIs and Web Workers, then downloaded individually or as a ZIP archive.

## Features

- Drag-and-drop or file picker intake for PNG, JPEG, and WebP inputs
- Per-file previews, dimensions, size metadata, status, and error messages
- Output conversion to PNG, JPEG, or WebP with quality control for lossy formats
- Resize modes for original size, width, height, or bounded exact box
- Worker-backed queue with limited concurrency to keep UI responsive
- Individual download buttons plus batch ZIP export
- Aggregate before/after size summary for the current batch
- Static deployment target for GitHub Pages, no backend required

## Privacy model

- Files never leave the browser during conversion
- No API calls are required for the core workflow
- The app is safe to host on static infrastructure such as GitHub Pages

## Stack

- React 19
- TypeScript with strict mode
- Vite
- Tailwind CSS v4 via `@tailwindcss/vite`
- `react-dropzone` for intake UX
- `fflate` for ZIP creation
- Web Workers, `createImageBitmap`, Canvas / OffscreenCanvas

## Local development

```bash
npm install
npm run dev
```

Open the local Vite URL shown in the terminal.

## Production build

```bash
npm run build
npm run preview
```

## GitHub Pages deployment

The repository includes `.github/workflows/deploy.yml` for automatic Pages deployment from the `main` branch.

Important notes:

- The workflow sets `VITE_BASE_PATH` to `/<repo-name>/` during CI builds.
- Local development keeps the default Vite base path of `/`.
- If you deploy outside GitHub Pages, set `VITE_BASE_PATH` to the public base path expected by your host.

Manual example:

```bash
VITE_BASE_PATH=/minti-converter/ npm run build
```

## Project structure

```text
src/
  app/
  components/
  features/converter/
  hooks/
  lib/
  styles/
  types/
  workers/
```

The split is intentionally small and production-friendly:

- `components/`: presentational UI
- `features/converter/`: validation, resize rules, conversion pipeline, queue helpers
- `hooks/`: app orchestration and object URL lifecycle
- `lib/`: download and formatting utilities
- `workers/`: heavy image processing

## Browser support

Targeted at modern evergreen browsers with support for:

- Web Workers
- `createImageBitmap`
- Canvas export APIs

When worker-side canvas support is missing, the app falls back to main-thread canvas conversion while keeping the workflow fully local.

## Post-MVP roadmap

- Smarter queue controls such as pause / resume
- Optional preset system for export recipes
- Better result comparison UI with side-by-side preview modes
- Broader format support where browser APIs allow it
- Accessibility pass with keyboard shortcuts and deeper screen reader hints
