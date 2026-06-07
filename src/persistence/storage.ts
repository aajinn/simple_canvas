import { restoreAppState, restoreElements } from "@excalidraw/excalidraw";
import type { AppState, BinaryFiles, ExcalidrawInitialDataState, OrderedExcalidrawElement } from "../types";
import type { CanvasInfo, CanvasRegistry } from "./types";
import { invalidatePreviewCache } from "../canvas/CanvasPreview";

const REGISTRY_KEY = "simple-canvas-registry";
const CANVAS_PREFIX = "simple-canvas-";

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function getRegistry(): CanvasRegistry {
  try {
    const raw = localStorage.getItem(REGISTRY_KEY);
    if (!raw) return { canvases: [] };
    return JSON.parse(raw) as CanvasRegistry;
  } catch {
    return { canvases: [] };
  }
}

function saveRegistry(registry: CanvasRegistry): void {
  try {
    localStorage.setItem(REGISTRY_KEY, JSON.stringify(registry));
  } catch {
    // quota exceeded
  }
}

export function listCanvases(): CanvasInfo[] {
  return getRegistry().canvases;
}

export function createCanvas(name?: string): CanvasInfo {
  const registry = getRegistry();
  const now = Date.now();
  const canvas: CanvasInfo = {
    id: generateId(),
    name: name || `Canvas ${registry.canvases.length + 1}`,
    createdAt: now,
    updatedAt: now,
  };
  registry.canvases.push(canvas);
  saveRegistry(registry);
  return canvas;
}

export function renameCanvas(id: string, name: string): void {
  const registry = getRegistry();
  const canvas = registry.canvases.find((c) => c.id === id);
  if (!canvas) return;
  canvas.name = name;
  canvas.updatedAt = Date.now();
  saveRegistry(registry);
}

export function deleteCanvas(id: string): void {
  const registry = getRegistry();
  registry.canvases = registry.canvases.filter((c) => c.id !== id);
  saveRegistry(registry);
  try {
    localStorage.removeItem(CANVAS_PREFIX + id);
  } catch {
    // ignore
  }
}

export function loadCanvas(id: string): ExcalidrawInitialDataState | null {
  try {
    const raw = localStorage.getItem(CANVAS_PREFIX + id);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      elements: restoreElements(parsed.elements ?? [], null, {
        repairBindings: true,
        deleteInvisibleElements: true,
      }),
      appState: restoreAppState(parsed.appState ?? {}, null),
      files: parsed.files ?? null,
    };
  } catch {
    return null;
  }
}

export function saveCanvas(
  id: string,
  elements: readonly OrderedExcalidrawElement[],
  appState: AppState,
  files?: BinaryFiles | null,
): void {
  try {
    localStorage.setItem(
      CANVAS_PREFIX + id,
      JSON.stringify({
        elements,
        appState: {
          ...appState,
          collaborators: [],
          isLoading: false,
          errorMessage: null,
        },
        files,
      }),
    );
    // update timestamp in registry
    const registry = getRegistry();
    const canvas = registry.canvases.find((c) => c.id === id);
    if (canvas) {
      canvas.updatedAt = Date.now();
      saveRegistry(registry);
    }
    invalidatePreviewCache(id);
  } catch {
    // quota exceeded
  }
}

// backward compat — migrate old single-scene to a named canvas
export function ensureDefaultCanvas(): string {
  const registry = getRegistry();
  if (registry.canvases.length > 0) {
    return registry.canvases[0].id;
  }
  // check if old data exists
  const oldKey = "simple-canvas-scene";
  try {
    const oldRaw = localStorage.getItem(oldKey);
    if (oldRaw) {
      const canvas = createCanvas("Canvas 1");
      // migrate the old data to the new key
      localStorage.setItem(CANVAS_PREFIX + canvas.id, oldRaw);
      localStorage.removeItem(oldKey);
      return canvas.id;
    }
  } catch {
    // ignore
  }
  const canvas = createCanvas("Canvas 1");
  return canvas.id;
}
