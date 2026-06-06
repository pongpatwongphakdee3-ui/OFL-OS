/**
 * Decode an audio blob and reduce it to N peak values in [0, 1] for drawing a
 * waveform on the timeline. Also returns the precise audio duration.
 */
export async function computeWaveform(
  blob: Blob,
  buckets = 1600
): Promise<{ peaks: number[]; duration: number }> {
  const arrayBuf = await blob.arrayBuffer();
  const AC: typeof AudioContext =
    window.AudioContext || (window as any).webkitAudioContext;
  const ctx = new AC();
  try {
    const audioBuf = await ctx.decodeAudioData(arrayBuf);
    const channel = audioBuf.getChannelData(0);
    const blockSize = Math.max(1, Math.floor(channel.length / buckets));
    const peaks: number[] = [];
    let max = 0;
    for (let i = 0; i < buckets; i++) {
      const startIdx = i * blockSize;
      let peak = 0;
      for (let j = 0; j < blockSize; j++) {
        const v = Math.abs(channel[startIdx + j] || 0);
        if (v > peak) peak = v;
      }
      peaks.push(peak);
      if (peak > max) max = peak;
    }
    // Normalize so the loudest part fills the track height.
    const norm = max > 0 ? 1 / max : 1;
    return {
      peaks: peaks.map((p) => p * norm),
      duration: audioBuf.duration,
    };
  } finally {
    ctx.close().catch(() => {});
  }
}
