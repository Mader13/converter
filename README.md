# Minti Converter

Static React application for converting images and processing PDFs fully in the browser. All operations run client-side — files never leave the browser. Built for privacy-first usage on GitHub Pages with no backend required.

## Image Tools

- Drag-and-drop or file picker intake for PNG, JPEG, and WebP inputs
- Per-file previews, dimensions, size metadata, status, and error messages
- Output conversion to PNG, JPEG, or WebP with quality control for lossy formats
- Resize modes for original size, width, height, or bounded exact box
- Worker-backed queue with limited concurrency to keep UI responsive
- Individual download buttons plus batch ZIP export
- Aggregate before/after size summary for the current batch

## PDF Tools

| Tool | Description |
|---|---|
| **PDF → JPG** | Renders each page of one or more PDFs to JPEG at 2× scale. Single page → `.jpg` direct download; multiple pages / files → `.zip` |
| **JPG → PDF** | Packs selected JPEG/JPG files into a single `images.pdf`. Order is drag-sortable. |
| **Merge PDF** | Combines 2 or more PDFs into `merged.pdf`, preserving page order. |
| **Split PDF** | Extracts each page of a PDF into its own file and downloads a `.zip`. |

### Intentionally unsupported

**Office ↔ PDF** (Word, Excel, PowerPoint) is not included. Accurate conversion requires a native Office rendering engine (LibreOffice, Word COM, etc.) and cannot be done client-side without unacceptable quality loss. This scope is excluded by design, not as a placeholder.

## Privacy model

- Files never leave the browser
- No API calls for any conversion workflow
- Safe to host on static infrastructure such as GitHub Pages

## GitHub Pages constraint

This is a hard static-hosting constraint. There is no server, no backend process, and no service worker offline mode. All PDF and image operations are synchronous local computation in the browser tab.

## Stack

- React 19
- TypeScript with strict mode
- Vite
- Tailwind CSS v4 via `@tailwindcss/vite`
- `react-dropzone` for intake UX
- `fflate` for ZIP creation
- `pdf-lib` for JPG→PDF, Merge, Split
- `pdfjs-dist` for PDF→JPG page rendering
- Web Workers, `createImageBitmap`, Canvas / OffscreenCanvas

## Development

```bash
npm install
npm run dev       # dev server
npm run lint      # ESLint
npm run build     # tsc + vite build
npm run preview   # preview built output
```
