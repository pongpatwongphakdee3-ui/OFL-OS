import { useRef, type CSSProperties, type RefObject } from "react";
import { useStore } from "../store";
import type { Cue, SubtitleStyle } from "../types";

function activeCues(cues: Cue[], t: number): Cue[] {
  return cues.filter((c) => t >= c.start && t < c.end);
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
            {active.map((c) => (
              <div
                key={c.id}
                className={"subtitle-line" + (style.bgEnabled ? " has-bg" : "")}
                style={
                  style.bgEnabled
                    ? ({ background: style.bgColor } as CSSProperties)
                    : undefined
                }
              >
                {c.text}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
