import { useState } from "react";
import type { CanvasInfo } from "../persistence/types";

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
                onClick={() => !isEditing && !isConfirmingDelete && onOpen(canvas.id)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  padding: 16,
                  borderRadius: 12,
                  background: isConfirmingDelete
                    ? "rgba(180,0,0,0.12)"
                    : "rgba(255,255,255,0.06)",
                  border: isConfirmingDelete
                    ? "1px solid rgba(255,80,80,0.3)"
                    : "1px solid rgba(255,255,255,0.08)",
                  cursor: isEditing || isConfirmingDelete ? "default" : "pointer",
                  transition: "background 0.15s",
                  minHeight: 120,
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
                {/* card icon */}
                <div style={{ fontSize: 28, lineHeight: 1, marginBottom: 10, opacity: 0.6 }}>
                  📄
                </div>

                {/* name */}
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
                      border: "1px solid rgba(255,255,255,0.3)",
                      background: "rgba(255,255,255,0.1)",
                      color: "rgba(255,255,255,0.9)",
                      fontSize: 14,
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      flex: 1,
                      color: isConfirmingDelete
                        ? "rgba(255,150,150,0.9)"
                        : "rgba(255,255,255,0.85)",
                      fontSize: 14,
                      fontWeight: 500,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      wordBreak: "break-word",
                      lineHeight: 1.3,
                    }}
                  >
                    {canvas.name}
                  </div>
                )}

                {/* actions */}
                {isConfirmingDelete ? (
                  <div
                    style={{
                      display: "flex",
                      gap: 6,
                      marginTop: 12,
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => confirmDelete(canvas.id)}
                      style={{
                        flex: 1,
                        padding: "6px 12px",
                        borderRadius: 6,
                        border: "none",
                        background: "rgba(200,50,50,0.8)",
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
                        flex: 1,
                        padding: "6px 12px",
                        borderRadius: 6,
                        border: "1px solid rgba(255,255,255,0.2)",
                        background: "transparent",
                        color: "rgba(255,255,255,0.7)",
                        fontSize: 12,
                        cursor: "pointer",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      gap: 6,
                      marginTop: 12,
                      flexWrap: "wrap",
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => onOpen(canvas.id)}
                      style={{
                        padding: "5px 12px",
                        borderRadius: 6,
                        border: "none",
                        background: "rgba(255,255,255,0.15)",
                        color: "rgba(255,255,255,0.9)",
                        fontSize: 12,
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      Open
                    </button>
                    <button
                      onClick={() =>
                        isEditing ? commitRename(canvas.id) : startRename(canvas)
                      }
                      style={{
                        padding: "5px 12px",
                        borderRadius: 6,
                        border: "none",
                        background: "rgba(255,255,255,0.08)",
                        color: "rgba(255,255,255,0.65)",
                        fontSize: 12,
                        cursor: "pointer",
                      }}
                    >
                      {isEditing ? "Save" : "Rename"}
                    </button>
                    <button
                      onClick={() => requestDelete(canvas.id)}
                      style={{
                        padding: "5px 12px",
                        borderRadius: 6,
                        border: "none",
                        background: "rgba(255,0,0,0.15)",
                        color: "rgba(255,100,100,0.9)",
                        fontSize: 12,
                        cursor: "pointer",
                      }}
                    >
                      Delete
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
