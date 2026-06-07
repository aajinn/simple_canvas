export interface ElementOverrides {
  visible?: boolean;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  opacity?: number;
  angle?: number;
  strokeWidth?: number;
  strokeColor?: string;
  backgroundColor?: string;
  fillStyle?: string;
}

export interface AnimationFrame {
  id: string;
  name: string;
  elementOverrides: Record<string, ElementOverrides>;
}

export interface AnimationState {
  frames: AnimationFrame[];
  currentFrameIndex: number;
  isPlaying: boolean;
  fps: number;
  loop: boolean;
}
