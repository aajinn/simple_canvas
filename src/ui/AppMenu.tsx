import { MainMenu } from "@excalidraw/excalidraw";
import type { AppState } from "../types";
import type { CanvasInfo } from "../persistence/types";

interface AppMenuProps {
  theme: AppState["theme"] | "system";
  onThemeChange: (t: AppState["theme"] | "system") => void;
  onSwitchCanvas: () => void;
  canvases: CanvasInfo[];
  activeCanvasId: string | null;
  onOpenCanvas: (id: string) => void;
  animationEnabled: boolean;
  onToggleAnimation: () => void;
  onAddFrame: () => void;
}

export function AppMenu({
  theme,
  onThemeChange,
  onSwitchCanvas,
  canvases,
  activeCanvasId,
  onOpenCanvas,
  animationEnabled,
  onToggleAnimation,
  onAddFrame,
}: AppMenuProps) {
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
      <MainMenu.Item onSelect={onToggleAnimation}>
        {animationEnabled ? "Disable Animation" : "Enable Animation"}
      </MainMenu.Item>
      {animationEnabled && (
        <MainMenu.Item onSelect={onAddFrame}>
          Add Animation Frame
        </MainMenu.Item>
      )}
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
      <MainMenu.Separator />
      {canvases.map((c) => (
        <MainMenu.Item
          key={c.id}
          selected={c.id === activeCanvasId}
          onSelect={() => onOpenCanvas(c.id)}
        >
          {c.name}
        </MainMenu.Item>
      ))}
    </MainMenu>
  );
}
