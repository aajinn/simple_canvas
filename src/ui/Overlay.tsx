import type { ReactNode } from "react";

interface OverlayProps {
  visible: boolean;
  onDoubleClick?: () => void;
  children?: ReactNode;
}

export function Overlay({ visible, onDoubleClick, children }: OverlayProps) {
  if (!visible) return null;

  return (
    <div
      onDoubleClick={onDoubleClick}
      style={{
        position: "absolute",
        inset: 0,
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        background: "rgba(15, 15, 25, 0.55)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        cursor: "default",
        userSelect: "none",
        zIndex: 10,
        padding: 24,
        overflow: "auto",
      }}
    >
      {children}
    </div>
  );
}
