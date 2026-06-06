// Native audio extraction using the Web Audio API. Works on iOS/iPad Safari
// (uses the system AAC/MP3 decoders) without any worker, wasm, or CDN — which
// is exactly where FFmpeg.wasm tends to fail. Decodes the file's audio track,
// mixes to mono, resamples to 16 kHz, and encodes a small 16-bit WAV that
// Gemini accepts directly. Also returns waveform peaks from the same pass.

const TARGET_RATE = 16000;

export interface DecodedAudio {
  wav: Blob; // audio/wav, 16 kHz mono, 16-bit PCM
  peaks: number[];
  duration: number;
}

export async function decodeFileToWav(
  file: File,
  buckets = 1600
): Promise<DecodedAudio> {
  const arrayBuf = await file.arrayBuffer();
  const AC: typeof AudioContext =
    window.AudioContext || (window as any).webkitAudioContext;
  if (!AC) throw new Error("เบราว์เซอร์นี้ไม่รองรับ Web Audio");
  const ctx = new AC();

  let audioBuf: AudioBuffer;
  try {
    // Some Safari versions only support the callback form of decodeAudioData.
    audioBuf = await new Promise<AudioBuffer>((resolve, reject) => {
      const p = ctx.decodeAudioData(arrayBuf, resolve, reject);
      if (p && typeof (p as Promise<AudioBuffer>).then === "function") {
        (p as Promise<AudioBuffer>).then(resolve, reject);
      }
    });
  } finally {
    ctx.close().catch(() => {});
  }

  const length = audioBuf.length;
  const channels = audioBuf.numberOfChannels;

  // Mix down to mono.
  const mono = new Float32Array(length);
  for (let c = 0; c < channels; c++) {
    const data = audioBuf.getChannelData(c);
    for (let i = 0; i < length; i++) mono[i] += data[i] / channels;
  }

  // Linear resample to 16 kHz.
  const ratio = audioBuf.sampleRate / TARGET_RATE;
  const outLen = Math.max(1, Math.floor(length / ratio));
  const out = new Float32Array(outLen);
  for (let i = 0; i < outLen; i++) {
    const idx = i * ratio;
    const i0 = Math.floor(idx);
    const i1 = Math.min(length - 1, i0 + 1);
    const frac = idx - i0;
    out[i] = mono[i0] * (1 - frac) + mono[i1] * frac;
  }

  // Waveform peaks from the resampled mono signal.
  const blockSize = Math.max(1, Math.floor(outLen / buckets));
  const peaks: number[] = [];
  let max = 0;
  for (let b = 0; b < buckets; b++) {
    const s = b * blockSize;
    let peak = 0;
    for (let j = 0; j < blockSize; j++) {
      const v = Math.abs(out[s + j] || 0);
      if (v > peak) peak = v;
    }
    peaks.push(peak);
    if (peak > max) max = peak;
  }
  const norm = max > 0 ? 1 / max : 1;

  return {
    wav: encodeWav16(out, TARGET_RATE),
    peaks: peaks.map((p) => p * norm),
    duration: audioBuf.duration,
  };
}

function encodeWav16(samples: Float32Array, rate: number): Blob {
  const n = samples.length;
  const buffer = new ArrayBuffer(44 + n * 2);
  const view = new DataView(buffer);
  const writeStr = (o: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(o + i, s.charCodeAt(i));
  };
  writeStr(0, "RIFF");
  view.setUint32(4, 36 + n * 2, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true); // PCM chunk size
  view.setUint16(20, 1, true); // format = PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, rate, true);
  view.setUint32(28, rate * 2, true); // byte rate
  view.setUint16(32, 2, true); // block align
  view.setUint16(34, 16, true); // bits per sample
  writeStr(36, "data");
  view.setUint32(40, n * 2, true);
  let o = 44;
  for (let i = 0; i < n; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(o, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    o += 2;
  }
  return new Blob([buffer], { type: "audio/wav" });
}
