import { useState } from "react";
import type { AnimationFrame } from "./types";

interface AnimationTimelineProps {
  frames: AnimationFrame[];
  currentFrameIndex: number;
  isPlaying: boolean;
  fps: number;
  loop: boolean;
  onAddFrame: () => void;
  onDeleteFrame: (id: string) => void;
  onRenameFrame: (id: string, name: string) => void;
  onGoToFrame: (index: number) => void;
  onPrevFrame: () => void;
  onNextFrame: () => void;
  onPlay: () => void;
  onStop: () => void;
  onSetFps: (fps: number) => void;
  onToggleLoop: () => void;
  onClearFrames: () => void;
}

export function AnimationTimeline({
  frames,
  currentFrameIndex,
  isPlaying,
  fps,
  loop,
  onAddFrame,
  onDeleteFrame,
  onRenameFrame,
  onGoToFrame,
  onPrevFrame,
  onNextFrame,
  onPlay,
  onStop,
  onSetFps,
  onToggleLoop,
  onClearFrames,
}: AnimationTimelineProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const handleDoubleClick = (frame: AnimationFrame) => {
    setEditingId(frame.id);
    setEditValue(frame.name);
  };

  const handleRenameSubmit = (id: string) => {
    if (editValue.trim()) {
      onRenameFrame(id, editValue.trim());
    }
    setEditingId(null);
  };

  return (
    <div style={styles.container}>
      {/* Playback controls */}
      <div style={styles.controls}>
        <button
          style={styles.controlBtn}
          onClick={onPrevFrame}
          title="Previous Frame (←)"
          disabled={frames.length === 0}
        >
          ⏮
        </button>

        <button
          style={{
            ...styles.controlBtn,
            ...styles.playBtn,
          }}
          onClick={isPlaying ? onStop : onPlay}
          title={isPlaying ? "Pause" : "Play"}
          disabled={frames.length === 0}
        >
          {isPlaying ? "⏸" : "▶"}
        </button>

        <button
          style={styles.controlBtn}
          onClick={onNextFrame}
          title="Next Frame (→)"
          disabled={frames.length === 0}
        >
          ⏭
        </button>

        <span style={styles.frameCounter}>
          {frames.length > 0
            ? `${Math.max(0, currentFrameIndex) + 1} / ${frames.length}`
            : "0 / 0"}
        </span>
      </div>

      {/* FPS + Loop */}
      <div style={styles.settings}>
        <label style={styles.label}>
          FPS
          <input
            type="range"
            min={1}
            max={30}
            value={fps}
            onChange={(e) => onSetFps(Number(e.target.value))}
            style={styles.slider}
          />
          <span style={styles.fpsValue}>{fps}</span>
        </label>

        <button
          style={{
            ...styles.toggleBtn,
            ...(loop ? styles.toggleActive : {}),
          }}
          onClick={onToggleLoop}
          title="Toggle Loop"
        >
          ↻
        </button>
      </div>

      {/* Frame list */}
      <div style={styles.frameList}>
        {frames.map((frame, i) => (
          <div
            key={frame.id}
            style={{
              ...styles.frame,
              ...(i === currentFrameIndex ? styles.frameActive : {}),
            }}
            onClick={() => onGoToFrame(i)}
          >
            {editingId === frame.id ? (
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={() => handleRenameSubmit(frame.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRenameSubmit(frame.id);
                  if (e.key === "Escape") setEditingId(null);
                }}
                style={styles.renameInput}
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span
                style={styles.frameName}
                onDoubleClick={() => handleDoubleClick(frame)}
                title="Double-click to rename"
              >
                {frame.name}
              </span>
            )}

            <button
              style={styles.deleteBtn}
              onClick={(e) => {
                e.stopPropagation();
                onDeleteFrame(frame.id);
              }}
              title="Delete frame"
            >
              ×
            </button>
          </div>
        ))}

        {frames.length === 0 && (
          <span style={styles.emptyHint}>No frames yet</span>
        )}
      </div>

      {/* Actions */}
      <div style={styles.actions}>
        <button style={styles.addBtn} onClick={onAddFrame} title="Capture current state as new frame">
          + Add Frame
        </button>

        {frames.length > 0 && (
          <button style={styles.clearBtn} onClick={onClearFrames} title="Delete all frames">
            Clear All
          </button>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "8px 16px",
    background: "rgba(30, 30, 40, 0.92)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    borderTop: "1px solid rgba(255,255,255,0.08)",
    zIndex: 200,
    fontFamily: "system-ui, -apple-system, sans-serif",
    color: "#e0e0e0",
    fontSize: 13,
    flexWrap: "wrap",
  },
  controls: {
    display: "flex",
    alignItems: "center",
    gap: 4,
  },
  controlBtn: {
    background: "rgba(255,255,255,0.08)",
    border: "none",
    borderRadius: 6,
    color: "#e0e0e0",
    width: 32,
    height: 32,
    fontSize: 14,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background 0.15s",
  },
  playBtn: {
    width: 36,
    height: 36,
    fontSize: 16,
    background: "rgba(74, 144, 238, 0.25)",
  },
  frameCounter: {
    marginLeft: 8,
    minWidth: 50,
    textAlign: "center",
    fontVariantNumeric: "tabular-nums",
    opacity: 0.7,
  },
  settings: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  label: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 12,
    opacity: 0.7,
    userSelect: "none",
  },
  slider: {
    width: 70,
    accentColor: "#4a90ee",
  },
  fpsValue: {
    minWidth: 20,
    textAlign: "center",
    fontVariantNumeric: "tabular-nums",
  },
  toggleBtn: {
    background: "rgba(255,255,255,0.08)",
    border: "none",
    borderRadius: 6,
    color: "#e0e0e0",
    width: 30,
    height: 30,
    fontSize: 16,
    cursor: "pointer",
    transition: "all 0.15s",
  },
  toggleActive: {
    background: "rgba(74, 144, 238, 0.35)",
    color: "#7ab4ff",
  },
  frameList: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    overflowX: "auto",
    flex: 1,
    minWidth: 0,
    padding: "2px 0",
  },
  frame: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    padding: "4px 10px",
    borderRadius: 6,
    background: "rgba(255,255,255,0.06)",
    cursor: "pointer",
    whiteSpace: "nowrap",
    flexShrink: 0,
    transition: "all 0.15s",
    border: "1px solid transparent",
  },
  frameActive: {
    background: "rgba(74, 144, 238, 0.2)",
    borderColor: "rgba(74, 144, 238, 0.4)",
  },
  frameName: {
    fontSize: 12,
    userSelect: "none",
  },
  deleteBtn: {
    background: "none",
    border: "none",
    color: "rgba(255,255,255,0.3)",
    fontSize: 14,
    cursor: "pointer",
    padding: "0 2px",
    lineHeight: 1,
    transition: "color 0.15s",
  },
  renameInput: {
    background: "rgba(0,0,0,0.3)",
    border: "1px solid rgba(74, 144, 238, 0.5)",
    borderRadius: 4,
    color: "#e0e0e0",
    fontSize: 12,
    padding: "2px 6px",
    width: 80,
    outline: "none",
  },
  emptyHint: {
    opacity: 0.4,
    fontSize: 12,
    fontStyle: "italic",
  },
  actions: {
    display: "flex",
    gap: 6,
    flexShrink: 0,
  },
  addBtn: {
    background: "rgba(74, 144, 238, 0.25)",
    border: "1px solid rgba(74, 144, 238, 0.3)",
    borderRadius: 6,
    color: "#7ab4ff",
    padding: "5px 12px",
    fontSize: 12,
    fontWeight: 500,
    cursor: "pointer",
    whiteSpace: "nowrap",
    transition: "all 0.15s",
  },
  clearBtn: {
    background: "rgba(238, 74, 74, 0.15)",
    border: "1px solid rgba(238, 74, 74, 0.2)",
    borderRadius: 6,
    color: "#ee7a7a",
    padding: "5px 10px",
    fontSize: 12,
    cursor: "pointer",
    whiteSpace: "nowrap",
    transition: "all 0.15s",
  },
};
