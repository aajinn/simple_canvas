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

## Architecture

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

### Component Map

```
newtab.html → main.tsx → App.tsx
                              ├── Canvas (wraps Excalidraw)
                              │     ├── AppMenu (custom main menu)
                              │     └── WelcomeScreen (custom welcome)
                              ├── CanvasManager (dashboard UI)
                              │     └── CanvasInfo (type)
                              ├── Overlay (frosted-glass backdrop)
                              ├── useTheme (light/dark/system)
                              ├── useHideMermaid (MutationObserver side-effect)
                              └── persistence/ (localStorage)
                                    ├── restoreAppState/restoreElements (Excalidraw)
                                    └── localStorage (registry + scenes)
```

### Data Flow

- **Create**: `App → createCanvas() → storage → localStorage (registry + scene)`
- **Load**: `App → loadCanvas(id) → storage → restoreElements/restoreAppState → Excalidraw`
- **Save**: `Excalidraw onChange → App onChange → saveCanvas() → storage → localStorage`
- **Delete**: `App → deleteCanvas(id) → storage → removes from registry and localStorage`

### Persistence Model

Two localStorage keys per canvas:
- `simple-canvas-registry` — metadata list (`CanvasInfo[]`)
- `simple-canvas-{id}` — scene data (`elements` + `appState`)

On first run, `ensureDefaultCanvas()` migrates any `simple-canvas-scene` data to the new format.

### Community Structure

| Community | Focus | Cohesion |
|-----------|-------|----------|
| Canvas CRUD | `createCanvas`, `deleteCanvas`, `getRegistry`, `loadCanvas` | 0.45 |
| Type System | `CanvasInfo`, `CanvasRegistry`, `SceneData` | 0.38 |
| UI Components | `App`, `CanvasManager`, `Overlay`, `AppMenu` | 0.17 |
| Excalidraw Integration | `Canvas`, `Excalidraw` wrapper, theme hooks | 0.15 |
| Package Config | `package.json`, dependencies | 0.13 |
| Manifest | `manifest.json`, Chrome extension config | 0.14 |

### God Nodes (most connected)

1. `App` — root orchestrator, 10 connections
2. `getRegistry()` — persistence entry point, 7 connections
3. `createCanvas()` — canvas factory, 7 connections
4. `Excalidraw` — drawing library bridge, 7 connections

### Key Design Patterns

- **State ownership**: `App.tsx` owns all shared state, passes down via props
- **Persistence abstraction**: all storage behind a function API (swap to IndexedDB without changing consumers)
- **Child slots**: Excalidraw's compositional pattern used to inject `AppMenu` and `WelcomeScreen`
- **Inline styles**: no CSS modules — all styling co-located in components
- **Type re-exports**: central type definitions to avoid deep Excalidraw imports

## Install (Chrome)

1. Run `npm run build`
2. Go to `chrome://extensions`
3. Enable **Developer mode**
4. **Load unpacked** and point to this directory