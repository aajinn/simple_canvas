import { useState, useEffect } from "react";
import type { AppState } from "../types";

type Theme = AppState["theme"] | "system";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("system");

  const editorTheme: AppState["theme"] =
    theme === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : theme;

  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => setTheme("system");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  return { theme, setTheme, editorTheme };
}
