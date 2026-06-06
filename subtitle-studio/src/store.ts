import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Cue, SubtitleStyle, ProcessStage } from "./types";
import { DEFAULT_MODEL } from "./lib/gemini";
import { clamp } from "./lib/time";

const DEFAULT_STYLE: SubtitleStyle = {
  fontFamily: "K2D",
  fontWeight: 700,
  fontSizePct: 8,
  color: "#ffffff",
  strokeColor: "#000000",
  strokeWidthPct: 14,
  shadow: true,
  bgEnabled: false,
  bgColor: "rgba(0,0,0,0.55)",
  uppercase: false,
  letterSpacing: 0,
  lineHeight: 1.1,
  posXPct: 50,
  posYPct: 78,
  maxWidthPct: 86,
};

const genId = () => crypto.randomUUID();

interface EditorState {
  // ---- media ----
  videoFile: File | null;
  videoUrl: string | null;
  duration: number;
  currentTime: number;
  isPlaying: boolean;

  audioBlob: Blob | null;
  peaks: number[] | null;

  // ---- subtitles ----
  cues: Cue[];
  selectedIds: string[];

  // ---- settings (persisted) ----
  wordsPerChunk: number;
  style: SubtitleStyle;
  apiKey: string;
  model: string;

  // ---- timeline ----
  pxPerSec: number;

  // ---- process ----
  stage: ProcessStage;
  progress: number; // 0..1
  statusMsg: string;
  errorMsg: string | null;

  // ---- actions ----
  setVideoFile: (file: File) => void;
  clearVideo: () => void;
  setDuration: (d: number) => void;
  setCurrentTime: (t: number) => void;
  setPlaying: (p: boolean) => void;

  setAudio: (blob: Blob) => void;
  setPeaks: (peaks: number[]) => void;

  setCues: (cues: Cue[]) => void;
  addCueAt: (time: number) => void;
  updateCue: (id: string, patch: Partial<Cue>) => void;
  applyCuePatches: (patches: { id: string; start: number; end: number }[]) => void;
  removeCues: (ids: string[]) => void;
  moveSelected: (deltaSec: number) => void;
  resizeCue: (id: string, edge: "start" | "end", time: number) => void;
  splitSelectedAt: (time: number) => void;
  mergeSelected: () => void;

  select: (ids: string[], additive?: boolean) => void;
  toggleSelect: (id: string) => void;
  clearSelection: () => void;

  setWordsPerChunk: (n: number) => void;
  setStyle: (patch: Partial<SubtitleStyle>) => void;
  setApiKey: (k: string) => void;
  setModel: (m: string) => void;
  setPxPerSec: (px: number) => void;

  setStage: (s: ProcessStage) => void;
  setProgress: (p: number) => void;
  setStatus: (msg: string) => void;
  setError: (msg: string | null) => void;
  resetSubtitles: () => void;
}

export const useStore = create<EditorState>()(
  persist(
    (set, get) => ({
      videoFile: null,
      videoUrl: null,
      duration: 0,
      currentTime: 0,
      isPlaying: false,
      audioBlob: null,
      peaks: null,
      cues: [],
      selectedIds: [],
      wordsPerChunk: 2,
      style: DEFAULT_STYLE,
      apiKey: "",
      model: DEFAULT_MODEL,
      pxPerSec: 80,
      stage: "idle",
      progress: 0,
      statusMsg: "",
      errorMsg: null,

      setVideoFile: (file) => {
        const prev = get().videoUrl;
        if (prev) URL.revokeObjectURL(prev);
        set({
          videoFile: file,
          videoUrl: URL.createObjectURL(file),
          duration: 0,
          currentTime: 0,
          isPlaying: false,
          audioBlob: null,
          peaks: null,
          cues: [],
          selectedIds: [],
          stage: "idle",
          progress: 0,
          statusMsg: "",
          errorMsg: null,
        });
      },

      clearVideo: () => {
        const prev = get().videoUrl;
        if (prev) URL.revokeObjectURL(prev);
        set({
          videoFile: null,
          videoUrl: null,
          duration: 0,
          currentTime: 0,
          isPlaying: false,
          audioBlob: null,
          peaks: null,
          cues: [],
          selectedIds: [],
          stage: "idle",
          progress: 0,
          statusMsg: "",
          errorMsg: null,
        });
      },

      setDuration: (d) => set({ duration: d }),
      setCurrentTime: (t) => set({ currentTime: clamp(t, 0, get().duration || t) }),
      setPlaying: (p) => set({ isPlaying: p }),

      setAudio: (blob) => set({ audioBlob: blob }),
      setPeaks: (peaks) => set({ peaks }),

      setCues: (cues) => set({ cues, selectedIds: [] }),

      addCueAt: (time) => {
        const dur = get().duration || time + 1.2;
        const start = clamp(time, 0, Math.max(0, dur - 0.2));
        const end = clamp(start + 1.2, start + 0.2, dur);
        const cue: Cue = { id: genId(), text: "ข้อความใหม่", start, end };
        set((s) => ({ cues: [...s.cues, cue], selectedIds: [cue.id] }));
      },

      updateCue: (id, patch) =>
        set((s) => ({
          cues: s.cues.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        })),

      applyCuePatches: (patches) =>
        set((s) => {
          const map = new Map(patches.map((p) => [p.id, p]));
          return {
            cues: s.cues.map((c) => {
              const p = map.get(c.id);
              return p ? { ...c, start: p.start, end: p.end } : c;
            }),
          };
        }),

      removeCues: (ids) =>
        set((s) => ({
          cues: s.cues.filter((c) => !ids.includes(c.id)),
          selectedIds: s.selectedIds.filter((x) => !ids.includes(x)),
        })),

      moveSelected: (deltaSec) => {
        const { cues, selectedIds, duration } = get();
        if (selectedIds.length === 0) return;
        const sel = cues.filter((c) => selectedIds.includes(c.id));
        const minStart = Math.min(...sel.map((c) => c.start));
        const maxEnd = Math.max(...sel.map((c) => c.end));
        // Clamp the group's delta so nothing slides past the clip bounds.
        let d = deltaSec;
        if (minStart + d < 0) d = -minStart;
        if (duration > 0 && maxEnd + d > duration) d = duration - maxEnd;
        set({
          cues: cues.map((c) =>
            selectedIds.includes(c.id)
              ? { ...c, start: c.start + d, end: c.end + d }
              : c
          ),
        });
      },

      resizeCue: (id, edge, time) =>
        set((s) => ({
          cues: s.cues.map((c) => {
            if (c.id !== id) return c;
            if (edge === "start") {
              return { ...c, start: clamp(time, 0, c.end - 0.1) };
            }
            return { ...c, end: clamp(time, c.start + 0.1, s.duration || time) };
          }),
        })),

      splitSelectedAt: (time) => {
        const { cues, selectedIds } = get();
        const targets = cues.filter(
          (c) =>
            (selectedIds.includes(c.id) || selectedIds.length === 0) &&
            time > c.start + 0.1 &&
            time < c.end - 0.1
        );
        if (targets.length === 0) return;
        const next: Cue[] = [];
        for (const c of cues) {
          if (targets.includes(c)) {
            const ratio = (time - c.start) / (c.end - c.start);
            const cut = Math.max(0, Math.min(c.text.length, Math.round(c.text.length * ratio)));
            next.push({ id: genId(), text: c.text.slice(0, cut).trim() || c.text, start: c.start, end: time });
            next.push({ id: genId(), text: c.text.slice(cut).trim() || c.text, start: time, end: c.end });
          } else {
            next.push(c);
          }
        }
        set({ cues: next, selectedIds: [] });
      },

      mergeSelected: () => {
        const { cues, selectedIds } = get();
        if (selectedIds.length < 2) return;
        const sel = cues
          .filter((c) => selectedIds.includes(c.id))
          .sort((a, b) => a.start - b.start);
        const merged: Cue = {
          id: genId(),
          text: sel.map((c) => c.text.trim()).filter(Boolean).join(" "),
          start: Math.min(...sel.map((c) => c.start)),
          end: Math.max(...sel.map((c) => c.end)),
        };
        const rest = cues.filter((c) => !selectedIds.includes(c.id));
        set({ cues: [...rest, merged], selectedIds: [merged.id] });
      },

      select: (ids, additive) =>
        set((s) => ({
          selectedIds: additive
            ? Array.from(new Set([...s.selectedIds, ...ids]))
            : ids,
        })),

      toggleSelect: (id) =>
        set((s) => ({
          selectedIds: s.selectedIds.includes(id)
            ? s.selectedIds.filter((x) => x !== id)
            : [...s.selectedIds, id],
        })),

      clearSelection: () => set({ selectedIds: [] }),

      setWordsPerChunk: (n) => set({ wordsPerChunk: clamp(Math.round(n), 1, 8) }),
      setStyle: (patch) => set((s) => ({ style: { ...s.style, ...patch } })),
      setApiKey: (k) => set({ apiKey: k }),
      setModel: (m) => set({ model: m }),
      setPxPerSec: (px) => set({ pxPerSec: clamp(px, 16, 400) }),

      setStage: (stage) => set({ stage }),
      setProgress: (progress) => set({ progress }),
      setStatus: (statusMsg) => set({ statusMsg }),
      setError: (errorMsg) =>
        set({ errorMsg, stage: errorMsg ? "error" : get().stage }),
      resetSubtitles: () => set({ cues: [], selectedIds: [] }),
    }),
    {
      name: "subtitle-studio",
      partialize: (s) => ({
        wordsPerChunk: s.wordsPerChunk,
        style: s.style,
        apiKey: s.apiKey,
        model: s.model,
        pxPerSec: s.pxPerSec,
      }),
    }
  )
);
