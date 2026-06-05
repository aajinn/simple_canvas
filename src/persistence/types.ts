import type { AppState } from "../types";
import type { OrderedExcalidrawElement } from "../types";

export interface SceneData {
  elements: readonly OrderedExcalidrawElement[];
  appState: AppState;
}

export interface CanvasInfo {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
}

export interface CanvasRegistry {
  canvases: CanvasInfo[];
}
