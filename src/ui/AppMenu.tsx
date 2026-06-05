import { MainMenu } from "@excalidraw/excalidraw";
import type { AppState } from "../types";

interface AppMenuProps {
  theme: AppState["theme"] | "system";
  onThemeChange: (t: AppState["theme"] | "system") => void;
  onSwitchCanvas: () => void;
}

export function AppMenu({ theme, onThemeChange, onSwitchCanvas }: AppMenuProps) {
  return (
    <MainMenu>
      <MainMenu.DefaultItems.LoadScene />
      <MainMenu.DefaultItems.SaveToActiveFile />
      <MainMenu.DefaultItems.Export />
      <MainMenu.DefaultItems.SaveAsImage />
      <MainMenu.DefaultItems.CommandPalette className="highlighted" />
      <MainMenu.DefaultItems.SearchMenu />
      <MainMenu.DefaultItems.Help />
      <MainMenu.DefaultItems.ClearCanvas />
      <MainMenu.Separator />
      <MainMenu.DefaultItems.ToggleTheme
        allowSystemTheme
        theme={theme}
        onSelect={onThemeChange}
      />
      <MainMenu.DefaultItems.ChangeCanvasBackground />
      <MainMenu.Separator />
      <MainMenu.Item onSelect={onSwitchCanvas}>
        Canvas Dashboard
      </MainMenu.Item>
    </MainMenu>
  );
}
