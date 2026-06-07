import { useState } from "react";
import type { CanvasInfo } from "../persistence/types";
import { CanvasPreview } from "../canvas/CanvasPreview";

interface CanvasManagerProps {
  canvases: CanvasInfo[];
  onCreate: (name: string) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  onOpen: (id: string) => void;
}

export function CanvasManager({
  canvases,
  onCreate,
  onRename,
  onDelete,
  onOpen,
}: CanvasManagerProps) {
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const handleCreate = () => {
    const name = newName.trim();
    if (!name) return;
    onCreate(name);
    setNewName("");
  };

  const startRename = (canvas: CanvasInfo) => {
    setEditingId(canvas.id);
    setEditValue(canvas.name);
    setConfirmingDelete(null);
  };

  const commitRename = (id: string) => {
    const name = editValue.trim();
    if (name && name !== canvases.find((c) => c.id === id)?.name) {
      onRename(id, name);
    }
    setEditingId(null);
  };

  const requestDelete = (id: string) => {
    setConfirmingDelete(id);
    setEditingId(null);
  };

  const cancelDelete = () => {
    setConfirmingDelete(null);
  };

  const confirmDelete = (id: string) => {
    onDelete(id);
    setConfirmingDelete(null);
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 640,
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          color: "rgba(255,255,255,0.9)",
          fontSize: 22,
          fontWeight: 600,
          letterSpacing: "0.02em",
          marginBottom: 20,
          textAlign: "center",
        }}
      >
        What are you working on?
      </div>

      {/* create */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleCreate();
          }}
          placeholder="New canvas name..."
          style={{
            flex: 1,
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.2)",
            background: "rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.9)",
            fontSize: 14,
            outline: "none",
          }}
        />
        <button
          onClick={handleCreate}
          style={{
            padding: "10px 20px",
            borderRadius: 10,
            border: "none",
            background: "rgba(255,255,255,0.15)",
            color: "rgba(255,255,255,0.9)",
            fontSize: 14,
            cursor: "pointer",
            fontWeight: 500,
          }}
        >
          + Create
        </button>
      </div>

      {/* grid */}
      {canvases.length === 0 ? (
        <div
          style={{
            color: "rgba(255,255,255,0.4)",
            textAlign: "center",
            fontSize: 14,
            padding: 32,
          }}
        >
          No canvases yet. Create one above.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: 12,
          }}
        >
          {canvases.map((canvas) => {
            const isEditing = editingId === canvas.id;
            const isConfirmingDelete = confirmingDelete === canvas.id;

            return (
              <div
                key={canvas.id}
                onClick={() => {
                  setMenuOpen(null);
                  if (!isEditing && !isConfirmingDelete) onOpen(canvas.id);
                }}
                style={{
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: 12,
                  background: isConfirmingDelete
                    ? "rgba(180,0,0,0.12)"
                    : "rgba(255,255,255,0.06)",
                  border: isConfirmingDelete
                    ? "1px solid rgba(255,80,80,0.3)"
                    : "1px solid rgba(255,255,255,0.08)",
                  cursor: isEditing || isConfirmingDelete ? "default" : "pointer",
                  transition: "background 0.15s",
                  overflow: "hidden",
                  minHeight: 140,
                }}
                onMouseEnter={(e) => {
                  if (!isEditing && !isConfirmingDelete)
                    e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                }}
                onMouseLeave={(e) => {
                  if (!isEditing && !isConfirmingDelete)
                    e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                }}
              >
                {/* card preview - fills entire card */}
                <div style={{ position: "absolute", inset: 0 }}>
                  <CanvasPreview canvasId={canvas.id} />
                </div>

                {/* gradient overlay */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)",
                  }}
                />

                {/* name overlay */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: "12px",
                  }}
                  onClick={(e) => e.stopPropagation()}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    if (!isEditing && !isConfirmingDelete) startRename(canvas);
                  }}
                >
                  {isEditing ? (
                    <input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") commitRename(canvas.id);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      onBlur={() => commitRename(canvas.id)}
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        width: "100%",
                        padding: "4px 8px",
                        borderRadius: 6,
                        border: "1px solid rgba(255,255,255,0.5)",
                        background: "rgba(0,0,0,0.4)",
                        color: "#fff",
                        fontSize: 13,
                        fontWeight: 500,
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        color: isConfirmingDelete
                          ? "rgba(255,150,150,0.9)"
                          : "#fff",
                        fontSize: 13,
                        fontWeight: 500,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        textShadow: "0 1px 3px rgba(0,0,0,0.5)",
                        cursor: "default",
                      }}
                    >
                      {canvas.name}
                    </div>
                  )}
                </div>

                {/* actions - three dot menu in top right */}
                {!isConfirmingDelete && (
                  <div
                    style={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() =>
                        setMenuOpen(menuOpen === canvas.id ? null : canvas.id)
                      }
                      style={{
                        padding: "4px 6px",
                        borderRadius: 4,
                        border: "none",
                        background: "rgba(0,0,0,0.4)",
                        color: "rgba(255,255,255,0.8)",
                        fontSize: 14,
                        cursor: "pointer",
                        lineHeight: 1,
                        backdropFilter: "blur(4px)",
                      }}
                    >
                      ⋮
                    </button>
                    {menuOpen === canvas.id && (
                      <div
                        style={{
                          position: "absolute",
                          right: 0,
                          top: "100%",
                          marginTop: 4,
                          background: "rgba(30,30,35,0.95)",
                          border: "1px solid rgba(255,255,255,0.12)",
                          borderRadius: 8,
                          padding: 4,
                          minWidth: 120,
                          zIndex: 10,
                        }}
                      >
                        <button
                          onClick={() => {
                            setMenuOpen(null);
                            requestDelete(canvas.id);
                          }}
                          style={{
                            width: "100%",
                            padding: "8px 12px",
                            borderRadius: 6,
                            border: "none",
                            background: "transparent",
                            color: "rgba(255,100,100,0.9)",
                            fontSize: 13,
                            cursor: "pointer",
                            textAlign: "left",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background =
                              "rgba(255,0,0,0.15)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "transparent")
                          }
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* delete confirmation overlay */}
                {isConfirmingDelete && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      background: "rgba(180,0,0,0.3)",
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => confirmDelete(canvas.id)}
                      style={{
                        padding: "8px 16px",
                        borderRadius: 6,
                        border: "none",
                        background: "rgba(200,50,50,0.9)",
                        color: "#fff",
                        fontSize: 12,
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      Confirm Delete
                    </button>
                    <button
                      onClick={cancelDelete}
                      style={{
                        padding: "8px 16px",
                        borderRadius: 6,
                        border: "1px solid rgba(255,255,255,0.3)",
                        background: "transparent",
                        color: "rgba(255,255,255,0.8)",
                        fontSize: 12,
                        cursor: "pointer",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div
        style={{
          color: "rgba(255,255,255,0.3)",
          textAlign: "center",
          fontSize: 12,
          marginTop: 24,
        }}
      >
        Click a card to open
      </div>
    </div>
  );
}
