import { Excalidraw } from "@excalidraw/excalidraw";
import type {
  AppState,
  BinaryFiles,
  ExcalidrawImperativeAPI,
  ExcalidrawInitialDataState,
  OrderedExcalidrawElement,
} from "../types";

import "@excalidraw/excalidraw/index.css";
import "./overrides.css";

window.EXCALIDRAW_ASSET_PATH = "/";

interface CanvasProps {
  onRef: (api: ExcalidrawImperativeAPI | null) => void;
  initialData: ExcalidrawInitialDataState | null;
  theme: AppState["theme"];
  onChange: (
    elements: readonly OrderedExcalidrawElement[],
    appState: AppState,
    files: BinaryFiles,
  ) => void;
  children?: React.ReactNode;
}

export function Canvas({
  onRef,
  initialData,
  theme,
  onChange,
  children,
}: CanvasProps) {
  return (
    <Excalidraw
      ref={onRef}
      initialData={initialData ?? {}}
      onChange={onChange}
      theme={theme}
      autoFocus
      handleKeyboardGlobally
      detectScroll={false}
      validateEmbeddable
      UIOptions={{
        canvasActions: {
          toggleTheme: true,
          export: { saveFileToDisk: true },
          loadScene: true,
          saveToActiveFile: true,
        },
        tools: {
          image: true,
        },
      }}
    >
      {children}
    </Excalidraw>
  );
}
