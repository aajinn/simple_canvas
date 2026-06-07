import { useCallback, useEffect, useRef, useState } from "react";
import type { AnimationFrame, AnimationState } from "./types";
import type { ExcalidrawImperativeAPI, OrderedExcalidrawElement } from "../types";

const STORAGE_PREFIX = "simple-canvas-animation-";

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function loadAnimationState(canvasId: string): AnimationState | null {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + canvasId);
    if (!raw) return null;
    return JSON.parse(raw) as AnimationState;
  } catch {
    return null;
  }
}

function saveAnimationState(canvasId: string, state: AnimationState): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + canvasId, JSON.stringify(state));
  } catch {
    // quota exceeded
  }
}

function captureFrame(
  elements: readonly OrderedExcalidrawElement[],
  name: string,
): AnimationFrame {
  const overrides: AnimationFrame["elementOverrides"] = {};
  for (const el of elements) {
    overrides[el.id] = {
      visible: el.visible,
      x: el.x,
      y: el.y,
      width: el.width,
      height: el.height,
      opacity: el.opacity,
      angle: el.angle,
      strokeWidth: el.strokeWidth,
      strokeColor: el.strokeColor,
      backgroundColor: el.backgroundColor,
      fillStyle: el.fillStyle,
    };
  }
  return {
    id: generateId(),
    name,
    elementOverrides: overrides,
  };
}

export function useAnimation(
  canvasId: string | null,
  excalidrawAPI: ExcalidrawImperativeAPI | null,
) {
  const [state, setState] = useState<AnimationState>({
    frames: [],
    currentFrameIndex: -1,
    isPlaying: false,
    fps: 8,
    loop: true,
  });

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  const apiRef = useRef(excalidrawAPI);
  apiRef.current = excalidrawAPI;

  // Load saved state when canvas changes
  useEffect(() => {
    if (!canvasId) return;
    const saved = loadAnimationState(canvasId);
    if (saved) {
      setState(saved);
    } else {
      setState({
        frames: [],
        currentFrameIndex: -1,
        isPlaying: false,
        fps: 8,
        loop: true,
      });
    }
  }, [canvasId]);

  // Persist on change
  useEffect(() => {
    if (canvasId) saveAnimationState(canvasId, state);
  }, [canvasId, state]);

  const stopPlayback = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setState((s) => ({ ...s, isPlaying: false }));
  }, []);

  const applyFrame = useCallback(
    (frame: AnimationFrame) => {
      const api = apiRef.current;
      if (!api) return;
      const currentElements = api.getSceneElements();
      const updates: OrderedExcalidrawElement[] = [];

      for (const el of currentElements) {
        const override = frame.elementOverrides[el.id];
        if (override) {
          const updated = { ...el } as OrderedExcalidrawElement;
          for (const [key, value] of Object.entries(override)) {
            if (value !== undefined) {
              (updated as Record<string, unknown>)[key] = value;
            }
          }
          // increment version so Excalidraw accepts the update
          (updated as Record<string, unknown>).version = (el.version ?? 0) + 1;
          (updated as Record<string, unknown>).versionNonce = Math.floor(Math.random() * 2000000000);
          updates.push(updated);
        }
      }

      if (updates.length > 0) {
        api.updateScene({ elements: updates });
      }
    },
    [],
  );

  const goToFrame = useCallback(
    (index: number) => {
      setState((s) => {
        const clamped = Math.max(0, Math.min(index, s.frames.length - 1));
        if (s.frames[clamped]) {
          setTimeout(() => applyFrame(s.frames[clamped]), 0);
        }
        return { ...s, currentFrameIndex: clamped };
      });
    },
    [applyFrame],
  );

  const addFrame = useCallback(() => {
    const api = apiRef.current;
    if (!api) return;
    const elements = api.getSceneElements();
    const frame = captureFrame(elements, `Frame ${stateRef.current.frames.length + 1}`);
    setState((s) => {
      const newFrames = [...s.frames, frame];
      return {
        ...s,
        frames: newFrames,
        currentFrameIndex: newFrames.length - 1,
      };
    });
  }, [canvasId]);

  const deleteFrame = useCallback(
    (frameId: string) => {
      setState((s) => {
        const idx = s.frames.findIndex((f) => f.id === frameId);
        const newFrames = s.frames.filter((f) => f.id !== frameId);
        let newIndex = s.currentFrameIndex;
        if (newFrames.length === 0) {
          newIndex = -1;
        } else if (idx <= s.currentFrameIndex) {
          newIndex = Math.max(0, s.currentFrameIndex - 1);
        }
        return { ...s, frames: newFrames, currentFrameIndex: newIndex };
      });
    },
    [],
  );

  const renameFrame = useCallback((frameId: string, name: string) => {
    setState((s) => ({
      ...s,
      frames: s.frames.map((f) => (f.id === frameId ? { ...f, name } : f)),
    }));
  }, []);

  const setFps = useCallback((fps: number) => {
    setState((s) => ({ ...s, fps: Math.max(1, Math.min(60, fps)) }));
  }, []);

  const toggleLoop = useCallback(() => {
    setState((s) => ({ ...s, loop: !s.loop }));
  }, []);

  const startPlayback = useCallback(() => {
    if (stateRef.current.frames.length === 0) return;

    setState((s) => ({ ...s, isPlaying: true }));

    const s = stateRef.current;
    if (s.currentFrameIndex >= 0 && s.frames[s.currentFrameIndex]) {
      applyFrame(s.frames[s.currentFrameIndex]);
    }
  }, [applyFrame]);

  // Playback timer
  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (!state.isPlaying) return;

    const interval = 1000 / state.fps;
    timerRef.current = setInterval(() => {
      setState((s) => {
        if (s.frames.length === 0) return { ...s, isPlaying: false };

        let nextIndex = s.currentFrameIndex + 1;
        if (nextIndex >= s.frames.length) {
          if (s.loop) {
            nextIndex = 0;
          } else {
            return { ...s, isPlaying: false };
          }
        }

        const nextFrame = s.frames[nextIndex];
        if (nextFrame) {
          setTimeout(() => applyFrame(nextFrame), 0);
        }

        return { ...s, currentFrameIndex: nextIndex };
      });
    }, interval);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state.isPlaying, state.fps, state.loop, applyFrame]);

  const prevFrame = useCallback(() => {
    stopPlayback();
    setState((s) => {
      const idx = Math.max(0, s.currentFrameIndex - 1);
      if (s.frames[idx]) {
        setTimeout(() => applyFrame(s.frames[idx]), 0);
      }
      return { ...s, currentFrameIndex: idx, isPlaying: false };
    });
  }, [stopPlayback, applyFrame]);

  const nextFrame = useCallback(() => {
    stopPlayback();
    setState((s) => {
      const idx = Math.min(s.frames.length - 1, s.currentFrameIndex + 1);
      if (s.frames[idx]) {
        setTimeout(() => applyFrame(s.frames[idx]), 0);
      }
      return { ...s, currentFrameIndex: idx, isPlaying: false };
    });
  }, [stopPlayback, applyFrame]);

  const clearFrames = useCallback(() => {
    stopPlayback();
    setState({
      frames: [],
      currentFrameIndex: -1,
      isPlaying: false,
      fps: stateRef.current.fps,
      loop: stateRef.current.loop,
    });
  }, [stopPlayback]);

  return {
    ...state,
    addFrame,
    deleteFrame,
    renameFrame,
    goToFrame,
    prevFrame,
    nextFrame,
    startPlayback,
    stopPlayback,
    setFps,
    toggleLoop,
    clearFrames,
  };
}
