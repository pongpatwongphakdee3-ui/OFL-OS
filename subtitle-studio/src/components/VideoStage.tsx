import { useRef, type CSSProperties, type RefObject } from "react";
import { useStore } from "../store";
import type { Cue, SubtitleStyle } from "../types";

function activeCues(cues: Cue[], t: number): Cue[] {
  return cues.filter((c) => t >= c.start && t < c.end);
}

// Thai has no spaces, so use Intl.Segmenter to split a chunk into real words
// for the "word pop" animation (falls back to whitespace splitting). Accessed
// without relying on TS lib types so it builds on any target.
type WordSegmenter = { segment(input: string): Iterable<{ segment: string }> };
let wordSeg: WordSegmenter | null = null;
let segReady = false;
function tokenize(text: string): string[] {
  if (!segReady) {
    try {
      const Seg = (Intl as unknown as { Segmenter?: new (...a: any[]) => WordSegmenter })
        .Segmenter;
      wordSeg = Seg ? new Seg("th", { granularity: "word" }) : null;
    } catch {
      wordSeg = null;
    }
    segReady = true;
  }
  if (wordSeg) return Array.from(wordSeg.segment(text), (s) => s.segment);
  return text.split(/(\s+)/);
}

function CueContent({ cue, style }: { cue: Cue; style: SubtitleStyle }) {
  if (style.animation !== "pop-word") return <>{cue.text}</>;
  const toks = tokenize(cue.text);
  const stagger = Math.max(60, style.animationSpeed * 0.5);
  return (
    <>
      {toks.map((t, i) =>
        t.trim() === "" ? (
          <span key={i}>{t}</span>
        ) : (
          <span
            key={i}
            className="tok"
            style={{ animationDelay: `${i * stagger}ms` }}
          >
            {t}
          </span>
        )
      )}
    </>
  );
}

function overlayVars(style: SubtitleStyle): CSSProperties {
  // Drive sizing with container-query height units (1cqh = 1% of the video box
  // height) so subtitles scale exactly with the preview, no JS measuring.
  const strokeCqh = (style.fontSizePct * style.strokeWidthPct) / 100;
  const vars: Record<string, string | number> = {
    left: `${style.posXPct}%`,
    top: `${style.posYPct}%`,
    maxWidth: `${style.maxWidthPct}%`,
    fontFamily: `'${style.fontFamily}', sans-serif`,
    fontWeight: style.fontWeight,
    fontSize: `${style.fontSizePct}cqh`,
    lineHeight: style.lineHeight,
    color: style.color,
    letterSpacing: `${style.letterSpacing}px`,
    textTransform: style.uppercase ? "uppercase" : "none",
    WebkitTextStrokeWidth: `${strokeCqh}cqh`,
    WebkitTextStrokeColor: style.strokeColor,
    paintOrder: "stroke fill",
    textShadow: style.shadow ? "0 0.4cqh 1cqh rgba(0,0,0,0.6)" : "none",
  };
  return vars as CSSProperties;
}

export default function VideoStage({
  videoRef,
}: {
  videoRef: RefObject<HTMLVideoElement>;
}) {
  const { videoUrl, cues, currentTime, style, setStyle, setDuration, setPlaying } =
    useStore();
  const boxRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const active = activeCues(cues, currentTime);

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current || !boxRef.current) return;
    const rect = boxRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setStyle({
      posXPct: Math.max(0, Math.min(100, x)),
      posYPct: Math.max(0, Math.min(100, y)),
    });
  };
  const onPointerUp = (e: React.PointerEvent) => {
    dragging.current = false;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  return (
    <div className="stage">
      <div className="video-box" ref={boxRef}>
        {videoUrl && (
          <video
            ref={videoRef}
            src={videoUrl}
            className="video-el"
            playsInline
            onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onClick={(e) => {
              const v = e.currentTarget;
              if (v.paused) v.play();
              else v.pause();
            }}
          />
        )}

        {active.length > 0 && (
          <div
            className="subtitle-overlay"
            style={overlayVars(style)}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            title="ลากเพื่อย้ายตำแหน่งซับ"
          >
            {active.map((c) => {
              const animClass =
                style.animation === "pop"
                  ? " anim-pop"
                  : style.animation === "fade-up"
                  ? " anim-fade-up"
                  : "";
              const lineStyle: Record<string, string | number> = {
                "--anim-dur": `${style.animationSpeed}ms`,
              };
              if (style.bgEnabled) lineStyle.background = style.bgColor;
              return (
                <div
                  // include animation in key so switching presets re-triggers it
                  key={c.id + style.animation}
                  className={
                    "subtitle-line" +
                    (style.bgEnabled ? " has-bg" : "") +
                    animClass
                  }
                  style={lineStyle as CSSProperties}
                >
                  <CueContent cue={c} style={style} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
