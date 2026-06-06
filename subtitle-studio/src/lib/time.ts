// Time formatting helpers.

/** 75.4 -> "1:15.4" (mm:ss.t) for compact UI labels. */
export function fmtClock(sec: number): string {
  if (!isFinite(sec) || sec < 0) sec = 0;
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  const t = Math.floor((sec * 10) % 10);
  return `${m}:${s.toString().padStart(2, "0")}.${t}`;
}

/** 75.4 -> "00:01:15,400" (SRT timestamp). */
export function fmtSrt(sec: number): string {
  if (!isFinite(sec) || sec < 0) sec = 0;
  const ms = Math.round(sec * 1000);
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const millis = ms % 1000;
  return (
    `${h.toString().padStart(2, "0")}:` +
    `${m.toString().padStart(2, "0")}:` +
    `${s.toString().padStart(2, "0")},` +
    `${millis.toString().padStart(3, "0")}`
  );
}

/** 75.4 -> "00:01:15.400" (WebVTT timestamp). */
export function fmtVtt(sec: number): string {
  return fmtSrt(sec).replace(",", ".");
}

export function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}
