# Simple Canvas

Chrome extension that replaces the new tab page with an Excalidraw-powered canvas.

## Project Structure

```
src/
├── newtab.html              # Chrome new tab entry point
├── main.tsx                 # React root render
├── App.tsx                  # Root orchestrator — composes features
│
├── canvas/                  # Excalidraw integration
│   └── Canvas.tsx            # Excalidraw wrapper component
│
├── persistence/             # Local data storage
│   ├── index.ts              # Public API
│   ├── storage.ts            # localStorage read/write
│   └── types.ts              # Persisted data shapes
│
├── theme/                   # Theme management
│   └── useTheme.ts           # Light/dark/system hook
│
├── ui/                      # UI components
│   ├── AppMenu.tsx            # Custom MainMenu (no Plus/collab)
│   ├── WelcomeScreen.tsx      # Custom WelcomeScreen
│   └── Overlay.tsx            # Frosted-glass unlock overlay
│
├── utils/                   # Utilities
│   └── hide-mermaid.ts        # MutationObserver Mermaid hider
│
└── types/                   # Shared TypeScript types
    └── index.ts
```

## Commands

- `npm run build` — production build
- `npm run dev` — watch mode build

## Architecture

- **App.tsx** is the orchestrator: owns state, composes feature components
- **Canvas.tsx** wraps `<Excalidraw>` — accepts props for theme, data, and change handler
- **persistence/** is self-contained — swap localStorage for IndexedDB later without touching canvas code
- **theme/** uses a custom hook — expand to a context provider if more components need theme
- **utils/** holds side-effect utilities like the MutationObserver that hides Mermaid from the toolbar

## Key Decisions

- All data is local (localStorage) — no cloud dependency
- Fonts are self-hosted in `public/fonts/`
- Deep imports from `@excalidraw/excalidraw/*` resolve to the main bundle via a patched `exports` field
- The `excalidraw-app/` folder at root is the full Excalidraw OSS app — reference only, not imported
