import {
  useEffect,
  useLayoutEffect,
  useRef,
  type PointerEvent as RPointerEvent,
  type RefObject,
} from "react";
import { useStore } from "../store";
import type { Cue } from "../types";
import { fmtClock, clamp } from "../lib/time";

const TICK_STEPS = [0.5, 1, 2, 5, 10, 15, 30, 60, 120, 300];

type DragState =
  | { kind: "none" }
  | { kind: "seek" }
  | { kind: "marquee"; startX: number; startTime: number }
  | {
      kind: "move";
      startX: number;
      originals: Map<string, { start: number; end: number }>;
      groupMin: number;
      groupMax: number;
    }
  | { kind: "resize"; id: string; edge: "start" | "end" };

export default function Timeline({
  videoRef,
}: {
  videoRef: RefObject<HTMLVideoElement>;
}) {
  const {
    cues,
    duration,
    currentTime,
    pxPerSec,
    peaks,
    selectedIds,
    setCurrentTime,
    select,
    toggleSelect,
    clearSelection,
    resizeCue,
    applyCuePatches,
    updateCue,
  } = useStore();

  const scrollRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drag = useRef<DragState>({ kind: "none" });
  const marqueeRef = useRef<HTMLDivElement>(null);

  const width = Math.max(600, duration * pxPerSec);

  const seek = (t: number) => {
    const clamped = clamp(t, 0, duration || t);
    if (videoRef.current) videoRef.current.currentTime = clamped;
    setCurrentTime(clamped);
  };

  const timeFromClientX = (clientX: number) => {
    const track = trackRef.current;
    if (!track) return 0;
    const rect = track.getBoundingClientRect();
    return (clientX - rect.left) / pxPerSec;
  };

  // ---- waveform rendering ----
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const backingW = Math.min(width, 16000);
    const h = canvas.height;
    canvas.width = backingW;
    ctx.clearRect(0, 0, backingW, h);
    if (!peaks || peaks.length === 0) return;
    ctx.fillStyle = "rgba(120, 200, 255, 0.55)";
    const mid = h / 2;
    for (let x = 0; x < backingW; x++) {
      const idx = Math.floor((x / backingW) * peaks.length);
      const amp = (peaks[idx] || 0) * (h * 0.46);
      ctx.fillRect(x, mid - amp, 1, amp * 2);
    }
  }, [peaks, width]);

  // keep playhead in view while playing
  useLayoutEffect(() => {
    const sc = scrollRef.current;
    if (!sc) return;
    const x = currentTime * pxPerSec;
    if (x < sc.scrollLeft + 40 || x > sc.scrollLeft + sc.clientWidth - 40) {
      sc.scrollLeft = x - sc.clientWidth / 2;
    }
  }, [currentTime, pxPerSec]);

  // ---- ruler ticks ----
  const step =
    TICK_STEPS.find((s) => s * pxPerSec >= 64) ?? TICK_STEPS[TICK_STEPS.length - 1];
  const ticks: number[] = [];
  for (let t = 0; t <= duration + step; t += step) ticks.push(t);

  // ---- global pointer handlers during a drag ----
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const d = drag.current;
      if (d.kind === "none") return;
      const t = timeFromClientX(e.clientX);

      if (d.kind === "seek") {
        seek(t);
      } else if (d.kind === "resize") {
        resizeCue(d.id, d.edge, t);
      } else if (d.kind === "move") {
        let delta = (e.clientX - d.startX) / pxPerSec;
        if (d.groupMin + delta < 0) delta = -d.groupMin;
        if (duration > 0 && d.groupMax + delta > duration)
          delta = duration - d.groupMax;
        const patches = Array.from(d.originals.entries()).map(([id, o]) => ({
          id,
          start: o.start + delta,
          end: o.end + delta,
        }));
        applyCuePatches(patches);
      } else if (d.kind === "marquee") {
        const el = marqueeRef.current;
        if (!el) return;
        const x1 = Math.min(d.startX, e.clientX);
        const x2 = Math.max(d.startX, e.clientX);
        const trackRect = trackRef.current!.getBoundingClientRect();
        el.style.display = "block";
        el.style.left = `${x1 - trackRect.left}px`;
        el.style.width = `${x2 - x1}px`;
      }
    };

    const onUp = (e: PointerEvent) => {
      const d = drag.current;
      if (d.kind === "marquee") {
        const a = Math.min(d.startTime, timeFromClientX(e.clientX));
        const b = Math.max(d.startTime, timeFromClientX(e.clientX));
        if (Math.abs(b - a) * pxPerSec < 4) {
          // treated as a click on empty space → seek + clear
          clearSelection();
          seek(d.startTime);
        } else {
          const hit = cues
            .filter((c) => c.end > a && c.start < b)
            .map((c) => c.id);
          select(hit);
        }
        if (marqueeRef.current) marqueeRef.current.style.display = "none";
      }
      drag.current = { kind: "none" };
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cues, duration, pxPerSec, selectedIds]);

  const startMove = (e: RPointerEvent, cue: Cue) => {
    e.stopPropagation();
    // selection logic
    let ids = selectedIds;
    if (e.shiftKey || e.metaKey || e.ctrlKey) {
      toggleSelect(cue.id);
      ids = selectedIds.includes(cue.id)
        ? selectedIds.filter((x) => x !== cue.id)
        : [...selectedIds, cue.id];
    } else if (!selectedIds.includes(cue.id)) {
      select([cue.id]);
      ids = [cue.id];
    }
    const chosen = cues.filter((c) => ids.includes(c.id));
    const originals = new Map(chosen.map((c) => [c.id, { start: c.start, end: c.end }]));
    drag.current = {
      kind: "move",
      startX: e.clientX,
      originals,
      groupMin: Math.min(...chosen.map((c) => c.start)),
      groupMax: Math.max(...chosen.map((c) => c.end)),
    };
  };

  const startResize = (e: RPointerEvent, cue: Cue, edge: "start" | "end") => {
    e.stopPropagation();
    if (!selectedIds.includes(cue.id)) select([cue.id]);
    drag.current = { kind: "resize", id: cue.id, edge };
  };

  return (
    <div className="timeline" ref={scrollRef}>
      <div
        className="timeline-inner"
        ref={trackRef}
        style={{ width }}
        onPointerDown={(e) => {
          // background press: start marquee/seek
          if (e.button !== 0) return;
          drag.current = {
            kind: "marquee",
            startX: e.clientX,
            startTime: timeFromClientX(e.clientX),
          };
        }}
      >
        {/* ruler */}
        <div className="ruler">
          {ticks.map((t) => (
            <div key={t} className="tick" style={{ left: t * pxPerSec }}>
              <span>{fmtClock(t)}</span>
            </div>
          ))}
        </div>

        {/* waveform */}
        <div className="wave-track">
          <canvas ref={canvasRef} height={72} style={{ width }} />
        </div>

        {/* cue track */}
        <div className="cue-track">
          {cues.map((c) => {
            const selected = selectedIds.includes(c.id);
            const left = c.start * pxPerSec;
            const w = Math.max(8, (c.end - c.start) * pxPerSec);
            return (
              <div
                key={c.id}
                className={"cue-block" + (selected ? " selected" : "")}
                style={{ left, width: w }}
                onPointerDown={(e) => startMove(e, c)}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  const txt = prompt("แก้ไขข้อความซับ", c.text);
                  if (txt != null) updateCue(c.id, { text: txt });
                }}
                title={c.text}
              >
                <span
                  className="cue-handle left"
                  onPointerDown={(e) => startResize(e, c, "start")}
                />
                <span className="cue-text">{c.text || "—"}</span>
                <span
                  className="cue-handle right"
                  onPointerDown={(e) => startResize(e, c, "end")}
                />
              </div>
            );
          })}
          <div ref={marqueeRef} className="marquee" />
        </div>

        {/* playhead */}
        <div className="playhead" style={{ left: currentTime * pxPerSec }}>
          <div
            className="playhead-grip"
            onPointerDown={(e) => {
              e.stopPropagation();
              drag.current = { kind: "seek" };
            }}
          />
        </div>
      </div>
    </div>
  );
}
