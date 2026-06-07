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
import { useAnimation } from "./animation";
import { AnimationTimeline } from "./animation/AnimationTimeline";
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
  const [toast, setToast] = useState<string | null>(null);
  const [animationEnabled, setAnimationEnabled] = useState(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { theme, setTheme, editorTheme } = useTheme();

  const animation = useAnimation(activeCanvasId, excalidrawAPI);

  // Reset API when canvas unmounts (excalidrawAPI prop doesn't fire null like ref)
  useEffect(() => {
    if (!activeCanvasId) {
      setExcalidrawAPI(null);
    }
  }, [activeCanvasId]);

  // Persist animation enabled state per canvas
  useEffect(() => {
    if (!activeCanvasId) return;
    try {
      const key = `simple-canvas-animation-enabled-${activeCanvasId}`;
      const saved = localStorage.getItem(key);
      setAnimationEnabled(saved === "true");
    } catch {
      setAnimationEnabled(false);
    }
  }, [activeCanvasId]);

  const toggleAnimation = useCallback(() => {
    setAnimationEnabled((prev) => {
      const next = !prev;
      if (activeCanvasId) {
        try {
          localStorage.setItem(`simple-canvas-animation-enabled-${activeCanvasId}`, String(next));
        } catch { /* ignore */ }
      }
      return next;
    });
  }, [activeCanvasId]);

  const showFrameToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 2000);
  }, []);

  const handleAddFrame = useCallback(() => {
    animation.addFrame();
    showFrameToast("Frame added");
  }, [animation.addFrame, showFrameToast]);

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

  // Escape to open dashboard, Ctrl+Shift+A to add frame
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
      if (e.key === "a" && e.ctrlKey && e.shiftKey && !locked && activeCanvasId && animationEnabled) {
        e.preventDefault();
        handleAddFrame();
      }
    };
    window.addEventListener("keydown", onKeyDown, { capture: true });
    return () => window.removeEventListener("keydown", onKeyDown, { capture: true });
  }, [locked, activeCanvasId, handleShowDashboard, handleAddFrame, animationEnabled]);

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
    (elements: readonly OrderedExcalidrawElement[], appState: AppState, files: BinaryFiles) => {
      if (!activeCanvasId) return;
      saveCanvas(activeCanvasId, elements, appState, files);
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
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
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
            <AppMenu
              theme={theme}
              onThemeChange={setTheme}
              onSwitchCanvas={handleShowDashboard}
              canvases={canvases}
              activeCanvasId={activeCanvasId}
              onOpenCanvas={openCanvas}
              animationEnabled={animationEnabled}
              onToggleAnimation={toggleAnimation}
              onAddFrame={handleAddFrame}
            />
            <AppWelcomeScreen />
          </Canvas>
        </div>
      )}

      {saveIndicator && (
        <div
          style={{
            position: "fixed",
            bottom: 60,
            right: 16,
            padding: "6px 14px",
            borderRadius: 8,
            background: "rgba(0,180,80,0.85)",
            color: "#fff",
            fontSize: 12,
            fontWeight: 500,
            zIndex: 210,
            pointerEvents: "none",
            transition: "opacity 0.2s",
          }}
        >
          {saveIndicator}
        </div>
      )}

      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 70,
            right: 16,
            padding: "6px 14px",
            borderRadius: 8,
            background: "rgba(74,144,238,0.85)",
            color: "#fff",
            fontSize: 12,
            fontWeight: 500,
            zIndex: 210,
            pointerEvents: "none",
            transition: "opacity 0.2s",
          }}
        >
          {toast}
        </div>
      )}

      {activeCanvasId && !locked && animationEnabled && (
        <AnimationTimeline
          frames={animation.frames}
          currentFrameIndex={animation.currentFrameIndex}
          isPlaying={animation.isPlaying}
          fps={animation.fps}
          loop={animation.loop}
          onAddFrame={handleAddFrame}
          onDeleteFrame={animation.deleteFrame}
          onRenameFrame={animation.renameFrame}
          onGoToFrame={animation.goToFrame}
          onPrevFrame={animation.prevFrame}
          onNextFrame={animation.nextFrame}
          onPlay={animation.startPlayback}
          onStop={animation.stopPlayback}
          onSetFps={animation.setFps}
          onToggleLoop={animation.toggleLoop}
          onClearFrames={animation.clearFrames}
        />
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
