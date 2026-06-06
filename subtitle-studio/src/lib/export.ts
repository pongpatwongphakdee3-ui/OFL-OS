import type { Cue } from "../types";
import { fmtSrt, fmtVtt } from "./time";

export function toSrt(cues: Cue[]): string {
  return cues
    .slice()
    .sort((a, b) => a.start - b.start)
    .map((c, i) => {
      return `${i + 1}\n${fmtSrt(c.start)} --> ${fmtSrt(c.end)}\n${c.text}\n`;
    })
    .join("\n");
}

export function toVtt(cues: Cue[]): string {
  const body = cues
    .slice()
    .sort((a, b) => a.start - b.start)
    .map((c) => `${fmtVtt(c.start)} --> ${fmtVtt(c.end)}\n${c.text}`)
    .join("\n\n");
  return `WEBVTT\n\n${body}\n`;
}

export function toJson(cues: Cue[]): string {
  const data = cues
    .slice()
    .sort((a, b) => a.start - b.start)
    .map((c) => ({ text: c.text, start: c.start, end: c.end }));
  return JSON.stringify(data, null, 2);
}

export function download(filename: string, content: string, mime = "text/plain") {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
