// A single subtitle block on the timeline.
export interface Cue {
  id: string;
  text: string;
  start: number; // seconds
  end: number; // seconds
}

// How each subtitle chunk animates in when it becomes active.
export type SubtitleAnimation = "none" | "pop" | "fade-up" | "pop-word";

// How the subtitles are rendered on top of the video (CapCut/Reels style).
export interface SubtitleStyle {
  fontFamily: string;
  fontWeight: number;
  // font size as a percentage of the video box height (so it scales with preview)
  fontSizePct: number;
  color: string;
  strokeColor: string;
  strokeWidthPct: number; // outline thickness as % of font size
  shadow: boolean;
  bgEnabled: boolean;
  bgColor: string;
  uppercase: boolean;
  letterSpacing: number;
  lineHeight: number;
  // anchor position of the subtitle box, as % of the video box (0..100)
  posXPct: number;
  posYPct: number;
  maxWidthPct: number; // max width of the text box as % of video width
  animation: SubtitleAnimation;
  animationSpeed: number; // ms for the entrance animation
}

export type ProcessStage =
  | "idle"
  | "loading-ffmpeg"
  | "extracting"
  | "decoding"
  | "transcribing"
  | "ready"
  | "error";

export interface TranscriptionResult {
  cues: Cue[];
}
