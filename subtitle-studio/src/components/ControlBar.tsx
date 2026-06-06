import { type RefObject } from "react";
import { useStore } from "../store";
import { fmtClock } from "../lib/time";
import { toSrt, toVtt, toJson, download } from "../lib/export";

export default function ControlBar({
  videoRef,
}: {
  videoRef: RefObject<HTMLVideoElement>;
}) {
  const { isPlaying, currentTime, duration, pxPerSec, setPxPerSec, cues } =
    useStore();

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play();
    else v.pause();
  };

  const skip = (d: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.max(0, Math.min(duration, v.currentTime + d));
  };

  const hasCues = cues.length > 0;

  return (
    <div className="controlbar">
      <div className="transport">
        <button className="ghost icon" onClick={() => skip(-2)} title="ถอย 2 วิ">
          ⏪
        </button>
        <button className="primary icon" onClick={togglePlay}>
          {isPlaying ? "⏸" : "▶"}
        </button>
        <button className="ghost icon" onClick={() => skip(2)} title="เดิน 2 วิ">
          ⏩
        </button>
        <span className="time-readout">
          {fmtClock(currentTime)} <span className="muted">/ {fmtClock(duration)}</span>
        </span>
      </div>

      <div className="zoom">
        <button className="ghost icon" onClick={() => setPxPerSec(pxPerSec / 1.4)}>
          🔍−
        </button>
        <input
          type="range"
          min={16}
          max={400}
          value={pxPerSec}
          onChange={(e) => setPxPerSec(Number(e.target.value))}
        />
        <button className="ghost icon" onClick={() => setPxPerSec(pxPerSec * 1.4)}>
          🔍+
        </button>
      </div>

      <div className="export">
        <button
          className="ghost"
          disabled={!hasCues}
          onClick={() => download("subtitles.srt", toSrt(cues), "application/x-subrip")}
        >
          ⬇ SRT
        </button>
        <button
          className="ghost"
          disabled={!hasCues}
          onClick={() => download("subtitles.vtt", toVtt(cues), "text/vtt")}
        >
          ⬇ VTT
        </button>
        <button
          className="ghost"
          disabled={!hasCues}
          onClick={() => {
            navigator.clipboard
              .writeText(toJson(cues))
              .then(() => {})
              .catch(() => download("subtitles.json", toJson(cues), "application/json"));
          }}
          title="คัดลอก JSON ไปคลิปบอร์ด"
        >
          ⧉ JSON
        </button>
      </div>
    </div>
  );
}
