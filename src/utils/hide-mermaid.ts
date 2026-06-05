import { useEffect } from "react";

export function useHideMermaid() {
  useEffect(() => {
    const hideMermaid = () => {
      document
        .querySelectorAll(".App-toolbar__extra-tools-dropdown button")
        .forEach((btn) => {
          if (btn.textContent?.toLowerCase().includes("mermaid")) {
            const item = btn.closest("[data-testid]") ?? btn.parentElement;
            if (item instanceof HTMLElement) item.style.display = "none";
          }
        });

      document
        .querySelectorAll(".App-toolbar__extra-tools-dropdown div")
        .forEach((el) => {
          if (el.textContent?.trim() === "Generate") {
            (el as HTMLElement).style.display = "none";
          }
        });
    };

    const observer = new MutationObserver(hideMermaid);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);
}
