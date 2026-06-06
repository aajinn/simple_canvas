import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas } from "./canvas/Canvas";
import { AppMenu } from "./ui/AppMenu";
import { AppWelcomeScreen } from "./ui/WelcomeScreen";
import { CanvasManager } from "./ui/CanvasManager";
import { Overlay } from "./ui/Overlay";
import { useTheme } from "./theme/useTheme";
import {
  listCanvases,
  createCanvas,
  renameCanvas,
  deleteCanvas,
  loadCanvas,
  saveCanvas,
  ensureDefaultCanvas,
} from "./persistence";
import { useHideMermaid } from "./utils/hide-mermaid";
import type {
  AppState,
  BinaryFiles,
  ExcalidrawImperativeAPI,
  OrderedExcalidrawElement,
} from "./types";
import type { CanvasInfo } from "./persistence/types";

export default function App() {
  const [locked, setLocked] = useState(true);
  const [activeCanvasId, setActiveCanvasId] = useState<string | null>(null);
  const [canvases, setCanvases] = useState<CanvasInfo[]>([]);
  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null>(null);
  const [saveIndicator, setSaveIndicator] = useState<string | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { theme, setTheme, editorTheme } = useTheme();

  useHideMermaid();

  // bootstrap default canvas
  useEffect(() => {
    const list = listCanvases();
    if (list.length > 0) {
      setCanvases(list);
      setActiveCanvasId(list[0].id);
    } else {
      const id = ensureDefaultCanvas();
      setCanvases(listCanvases());
      setActiveCanvasId(id);
    }
  }, []);

  const handleShowDashboard = useCallback(() => {
    setLocked(true);
    setCanvases(listCanvases());
  }, []);

  // Escape to open dashboard
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && activeCanvasId) {
        e.stopPropagation();
        if (locked) {
          setLocked(false);
        } else {
          handleShowDashboard();
        }
      }
    };
    window.addEventListener("keydown", onKeyDown, { capture: true });
    return () => window.removeEventListener("keydown", onKeyDown, { capture: true });
  }, [locked, activeCanvasId, handleShowDashboard]);

  const initialData = useMemo(() => {
    if (!activeCanvasId) return {};
    return loadCanvas(activeCanvasId) ?? {};
  }, [activeCanvasId]);

  const openCanvas = useCallback((id: string) => {
    setActiveCanvasId(id);
    setLocked(false);
  }, []);

  const handleCreate = useCallback((name: string) => {
    const canvas = createCanvas(name);
    setCanvases(listCanvases());
    setActiveCanvasId(canvas.id);
    setLocked(false);
  }, []);

  const handleRename = useCallback((id: string, name: string) => {
    renameCanvas(id, name);
    setCanvases(listCanvases());
  }, []);

  const handleDelete = useCallback((id: string) => {
    deleteCanvas(id);
    setCanvases(listCanvases());
    if (activeCanvasId === id) {
      setActiveCanvasId(null);
    }
  }, [activeCanvasId]);

  const onChange = useCallback(
    (elements: readonly OrderedExcalidrawElement[], appState: AppState, _files: BinaryFiles) => {
      if (!activeCanvasId) return;
      saveCanvas(activeCanvasId, elements, appState);
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      setSaveIndicator(null);
      saveTimerRef.current = setTimeout(() => {
        setSaveIndicator("Saved");
        setTimeout(() => setSaveIndicator(null), 1500);
      }, 800);
    },
    [activeCanvasId],
  );

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      {activeCanvasId && (
        <div style={{ width: "100%", height: "100%" }}>
          <Canvas
            key={activeCanvasId}
            onRef={setExcalidrawAPI}
            initialData={initialData}
            theme={editorTheme}
            onChange={onChange}
          >
            <AppMenu theme={theme} onThemeChange={setTheme} onSwitchCanvas={handleShowDashboard} />
            <AppWelcomeScreen />
          </Canvas>
        </div>
      )}

      {saveIndicator && (
        <div
          style={{
            position: "fixed",
            bottom: 16,
            right: 16,
            padding: "6px 14px",
            borderRadius: 8,
            background: "rgba(0,180,80,0.85)",
            color: "#fff",
            fontSize: 12,
            fontWeight: 500,
            zIndex: 100,
            pointerEvents: "none",
            transition: "opacity 0.2s",
          }}
        >
          {saveIndicator}
        </div>
      )}

      <Overlay
        visible={locked}
        onDoubleClick={() => openCanvas(canvases[0]?.id ?? "")}
      >
        <CanvasManager
          canvases={canvases}
          onCreate={handleCreate}
          onRename={handleRename}
          onDelete={handleDelete}
          onOpen={openCanvas}
        />
      </Overlay>
    </div>
  );
}
