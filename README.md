# Simple Canvas

Replace the Chrome new tab page with a local, multi-canvas Excalidraw workspace.

## Features

- **Multiple canvases** — create, rename, delete, and switch between canvases from the dashboard
- **Local storage only** — everything stays in your browser's localStorage
- **Escape toggle** — press Escape to open the dashboard, press again to return
- **Minimal UI** — library sidebar and help links hidden; keyboard shortcuts retained

## Usage

1. Open a new tab to see the canvas or the "What are you working on?" dashboard
2. Double-click the overlay or press Escape to access the dashboard
3. From the app menu (top-right), select **Canvas Dashboard**

## Commands

| Command | Description |
|---------|-------------|
| `npm run build` | production build |
| `npm run dev`   | watch mode       |

## Structure

```
src/
├── App.tsx              # orchestrator — state, Escape toggle, conditional rendering
├── canvas/              # Excalidraw wrapper
├── persistence/         # localStorage CRUD (multi-canvas)
├── theme/               # light/dark/system hook
├── ui/                  # dashboard, overlay, app menu, welcome screen
├── utils/               # side-effect utilities
└── types/               # TypeScript types
```

## Install (Chrome)

1. Run `npm run build`
2. Go to `chrome://extensions`
3. Enable **Developer mode**
4. **Load unpacked** and point to this directory
