import type { AppState, BinaryFiles } from "../types";
import type { OrderedExcalidrawElement } from "../types";

export interface SceneData {
  elements: readonly OrderedExcalidrawElement[];
  appState: AppState;
  files?: BinaryFiles;
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
