import type { Cue } from "../types";

export const GEMINI_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.5-pro",
  "gemini-2.0-flash",
  "gemini-flash-latest",
] as const;

export const DEFAULT_MODEL = "gemini-2.5-flash";

// ~14 MB of raw audio ≈ ~18.6 MB once base64-encoded, which is the practical
// ceiling for an inline Gemini request. Mono 16 kHz 64 kbps MP3 stays well
// under this for any normal Reels-length clip.
const INLINE_LIMIT_BYTES = 14 * 1024 * 1024;

/** The exact Thai instruction the user specified, with the chunk size woven in. */
export function buildPrompt(wordsPerChunk: number): string {
  return [
    `ถอดเสียงเฉพาะ 'คำพูดของมนุษย์' ที่เป็นภาษาไทยในคลิปนี้เท่านั้น`,
    `ห้ามถอดเสียงสัตว์ (เช่น เสียงแมว หมา), เสียงดนตรี, หรือเสียงสภาพแวดล้อมอย่างเด็ดขาด`,
    `แบ่งคำพูดเป็นท่อนสั้นๆ ตามจังหวะการหายใจหรือการเว้นวรรคตามธรรมชาติ`,
    `โดยให้แต่ละท่อนมีความยาวประมาณ ${wordsPerChunk} คำ (ปรับเพิ่มลดจำนวนคำได้นิดหน่อยเพื่อให้ได้ใจความสมบูรณ์และตรงจังหวะปากมากที่สุด)`,
    `พร้อมระบุเวลาเริ่ม (start) และจบ (end) เป็นวินาทีให้แม่นยำและตรงกับเสียงพูดมากที่สุด`,
    `หากช่วงไหนไม่มีเสียงคนพูด ห้ามสร้างข้อมูลของช่วงนั้นมาเด็ดขาด`,
    ``,
    `ตอบกลับเป็น JSON array เท่านั้น โดยแต่ละสมาชิกมี field: text (string), start (number, วินาที), end (number, วินาที)`,
    `ห้ามมีข้อความอื่นนอกเหนือจาก JSON`,
  ].join("\n");
}

const RESPONSE_SCHEMA = {
  type: "ARRAY",
  items: {
    type: "OBJECT",
    properties: {
      text: { type: "STRING" },
      start: { type: "NUMBER" },
      end: { type: "NUMBER" },
    },
    required: ["text", "start", "end"],
  },
};

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(
      ...(bytes.subarray(i, i + chunk) as unknown as number[])
    );
  }
  return btoa(binary);
}

export class GeminiError extends Error {}

interface RawCue {
  text?: unknown;
  start?: unknown;
  end?: unknown;
}

function normalizeCues(raw: RawCue[]): Cue[] {
  const cues: Cue[] = [];
  for (const r of raw) {
    const text = typeof r.text === "string" ? r.text.trim() : "";
    const start = Number(r.start);
    const end = Number(r.end);
    if (!text) continue;
    if (!isFinite(start) || !isFinite(end)) continue;
    const s = Math.max(0, start);
    const e = Math.max(s + 0.05, end);
    cues.push({
      id: crypto.randomUUID(),
      text,
      start: s,
      end: e,
    });
  }
  cues.sort((a, b) => a.start - b.start);
  return cues;
}

/** Pull the first JSON array out of a text blob, in case the model adds prose. */
function parseJsonArray(text: string): RawCue[] {
  const trimmed = text.trim();
  try {
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    /* fall through to bracket extraction */
  }
  const first = trimmed.indexOf("[");
  const last = trimmed.lastIndexOf("]");
  if (first !== -1 && last > first) {
    const slice = trimmed.slice(first, last + 1);
    const parsed = JSON.parse(slice);
    if (Array.isArray(parsed)) return parsed;
  }
  throw new GeminiError("ไม่พบ JSON array ในคำตอบของโมเดล");
}

export interface TranscribeOpts {
  apiKey: string;
  model: string;
  wordsPerChunk: number;
  audio: Blob;
  signal?: AbortSignal;
}

export async function transcribe(opts: TranscribeOpts): Promise<Cue[]> {
  const { apiKey, model, wordsPerChunk, audio, signal } = opts;

  if (!apiKey.trim()) {
    throw new GeminiError("ยังไม่ได้ใส่ Gemini API key");
  }

  const buf = new Uint8Array(await audio.arrayBuffer());
  if (buf.byteLength > INLINE_LIMIT_BYTES) {
    const mb = (buf.byteLength / (1024 * 1024)).toFixed(1);
    throw new GeminiError(
      `ไฟล์เสียงยาวเกินไป (${mb} MB) สำหรับการส่งครั้งเดียว — ลองตัดคลิปให้สั้นลง (แนะนำไม่เกิน ~25–30 นาที)`
    );
  }

  const body = {
    contents: [
      {
        role: "user",
        parts: [
          {
            inline_data: {
              mime_type: audio.type || "audio/mpeg",
              data: bytesToBase64(buf),
            },
          },
          { text: buildPrompt(wordsPerChunk) },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.2,
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
    },
  };

  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/` +
    `${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal,
    });
  } catch (e: any) {
    if (e?.name === "AbortError") throw e;
    throw new GeminiError("เชื่อมต่อ Gemini ไม่สำเร็จ: " + (e?.message || e));
  }

  if (!res.ok) {
    let detail = `${res.status} ${res.statusText}`;
    try {
      const err = await res.json();
      detail = err?.error?.message || detail;
    } catch {
      /* keep status text */
    }
    if (res.status === 400 && /api key/i.test(detail)) {
      throw new GeminiError("API key ไม่ถูกต้อง — ตรวจสอบใน Google AI Studio");
    }
    if (res.status === 429) {
      throw new GeminiError("เกินโควต้า/ถูกจำกัดอัตรา (429) — รอสักครู่แล้วลองใหม่");
    }
    throw new GeminiError("Gemini ตอบกลับผิดพลาด: " + detail);
  }

  const data = await res.json();

  const finishReason = data?.candidates?.[0]?.finishReason;
  if (finishReason === "SAFETY") {
    throw new GeminiError("คำตอบถูกบล็อกด้วยตัวกรองความปลอดภัยของโมเดล");
  }

  const parts = data?.candidates?.[0]?.content?.parts;
  const text: string = Array.isArray(parts)
    ? parts
        .map((p: any) => p?.text || "")
        .join("")
        .trim()
    : "";

  if (!text) {
    throw new GeminiError("โมเดลไม่ส่งข้อความกลับมา (อาจไม่พบเสียงพูดในคลิป)");
  }

  const cues = normalizeCues(parseJsonArray(text));
  return cues;
}
