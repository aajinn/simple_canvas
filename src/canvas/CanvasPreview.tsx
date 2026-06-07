import { useEffect, useState, memo } from "react";
import { exportToSvg } from "@excalidraw/excalidraw";
import { restoreElements } from "@excalidraw/excalidraw";
import { loadCanvas } from "../persistence";

const previewCache = new Map<string, string>();

export function invalidatePreviewCache(canvasId?: string) {
  if (canvasId) {
    previewCache.delete(canvasId);
  } else {
    previewCache.clear();
  }
}

interface CanvasPreviewProps {
  canvasId: string;
}

export const CanvasPreview = memo(function CanvasPreview({
  canvasId,
}: CanvasPreviewProps) {
  const [svgHtml, setSvgHtml] = useState<string | null>(
    () => previewCache.get(canvasId) ?? null
  );

  useEffect(() => {
    const cached = previewCache.get(canvasId);
    if (cached) {
      setSvgHtml(cached);
      return;
    }

    let cancelled = false;

    async function render() {
      try {
        const data = loadCanvas(canvasId);
        if (!data || !data.elements || data.elements.length === 0) {
          return;
        }

        const elements = restoreElements(data.elements as any, null, {
          repairBindings: true,
          deleteInvisibleElements: true,
        }) as any;

        if (elements.length === 0) return;

        const svgElement = await exportToSvg({
          elements,
          appState: {
            exportBackground: true,
            viewBackgroundColor: data.appState?.viewBackgroundColor || "#ffffff",
            exportWithDarkMode: data.appState?.theme === "dark",
            exportPadding: 20,
          },
          files: data.files || null,
        });

        if (!cancelled) {
          svgElement.removeAttribute("width");
          svgElement.removeAttribute("height");
          svgElement.style.width = "100%";
          svgElement.style.height = "100%";
          svgElement.style.objectFit = "contain";
          svgElement.setAttribute("preserveAspectRatio", "xMidYMid meet");
          const html = svgElement.outerHTML;
          previewCache.set(canvasId, html);
          setSvgHtml(html);
        }
      } catch {}
    }

    render();
    return () => {
      cancelled = true;
    };
  }, [canvasId]);

  if (!svgHtml) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          overflow: "hidden",
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
      }}
      dangerouslySetInnerHTML={{ __html: svgHtml }}
    />
  );
});
