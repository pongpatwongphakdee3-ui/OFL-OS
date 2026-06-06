import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

// Single-threaded core — no SharedArrayBuffer / cross-origin isolation needed,
// so we don't have to set COOP/COEP headers (which would break Google Fonts).
const CORE_BASE = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";

let ffmpeg: FFmpeg | null = null;
let loadingPromise: Promise<FFmpeg> | null = null;

export type ProgressCb = (ratio: number) => void;

async function getFFmpeg(onLog?: (msg: string) => void): Promise<FFmpeg> {
  if (ffmpeg) return ffmpeg;
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    const instance = new FFmpeg();
    if (onLog) {
      instance.on("log", ({ message }) => onLog(message));
    }
    await instance.load({
      coreURL: await toBlobURL(`${CORE_BASE}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(`${CORE_BASE}/ffmpeg-core.wasm`, "application/wasm"),
    });
    ffmpeg = instance;
    return instance;
  })();

  return loadingPromise;
}

/** Warm up the wasm core ahead of time (e.g. while the user picks settings). */
export async function preloadFFmpeg(): Promise<void> {
  await getFFmpeg();
}

/**
 * Extract a small, speech-friendly audio track from any video/audio file:
 * mono, 16 kHz, 64 kbps MP3. This keeps the payload tiny for Gemini even when
 * the source clip is well over 100 MB.
 */
export async function extractAudio(
  file: File,
  onProgress?: ProgressCb
): Promise<Blob> {
  const instance = await getFFmpeg();

  const progressHandler = ({ progress }: { progress: number }) => {
    if (onProgress) onProgress(Math.min(1, Math.max(0, progress)));
  };
  instance.on("progress", progressHandler);

  // Keep a stable extension so ffmpeg can sniff the container.
  const ext = (file.name.split(".").pop() || "bin").toLowerCase();
  const inputName = `input.${ext}`;
  const outputName = "audio.mp3";

  try {
    await instance.writeFile(inputName, await fetchFile(file));
    await instance.exec([
      "-i",
      inputName,
      "-vn", // drop video
      "-ac",
      "1", // mono
      "-ar",
      "16000", // 16 kHz
      "-b:a",
      "64k",
      "-f",
      "mp3",
      outputName,
    ]);
    const data = await instance.readFile(outputName);
    // data is a Uint8Array; copy into a fresh ArrayBuffer for the Blob.
    const bytes = data as Uint8Array;
    const blob = new Blob([bytes.slice()], { type: "audio/mpeg" });

    // Clean up the virtual FS so memory is reclaimed between clips.
    await instance.deleteFile(inputName).catch(() => {});
    await instance.deleteFile(outputName).catch(() => {});

    return blob;
  } finally {
    instance.off("progress", progressHandler);
  }
}
