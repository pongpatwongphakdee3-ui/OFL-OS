import { useStore } from "../store";

const STAGE_LABEL: Record<string, string> = {
  "loading-ffmpeg": "กำลังโหลดตัวแปลงเสียง…",
  extracting: "กำลังดึงเสียงออกจากคลิป…",
  decoding: "กำลังวิเคราะห์คลื่นเสียง…",
  transcribing: "กำลังถอดเสียงด้วย Gemini…",
};

export default function TranscribePanel({
  onTranscribe,
  onOpenSettings,
}: {
  onTranscribe: () => void;
  onOpenSettings: () => void;
}) {
  const {
    wordsPerChunk,
    setWordsPerChunk,
    stage,
    progress,
    errorMsg,
    cues,
    apiKey,
    audioBlob,
  } = useStore();

  const busy = ["loading-ffmpeg", "extracting", "decoding", "transcribing"].includes(
    stage
  );
  const hasKey = apiKey.trim().length > 0;

  return (
    <section className="panel">
      <h3>1 · ถอดเสียง → ซับ</h3>

      <label className="field">
        <span>จำนวนคำต่อท่อน (Reels แนะนำ 2)</span>
        <div className="chunk-row">
          {[2, 3, 4].map((n) => (
            <button
              key={n}
              className={"chip" + (wordsPerChunk === n ? " on" : "")}
              onClick={() => setWordsPerChunk(n)}
            >
              {n} คำ
            </button>
          ))}
          <input
            type="number"
            min={1}
            max={8}
            value={wordsPerChunk}
            onChange={(e) => setWordsPerChunk(Number(e.target.value))}
          />
        </div>
      </label>

      {!hasKey && (
        <button className="warn-link" onClick={onOpenSettings}>
          ⚠️ ยังไม่ได้ใส่ Gemini API key — คลิกเพื่อตั้งค่า
        </button>
      )}

      <button
        className="primary big"
        disabled={busy || !hasKey}
        onClick={onTranscribe}
      >
        {busy
          ? "กำลังทำงาน…"
          : cues.length > 0
          ? `ถอดเสียงใหม่ (${wordsPerChunk} คำ/ท่อน)`
          : audioBlob
          ? "ถอดเสียงด้วย Gemini"
          : "ดึงเสียง + ถอดเสียง"}
      </button>

      {busy && (
        <div className="progress">
          <div className="bar">
            <div
              className="fill"
              style={{
                width:
                  stage === "transcribing"
                    ? "100%"
                    : `${Math.round(progress * 100)}%`,
              }}
            />
          </div>
          <span className="muted">
            {STAGE_LABEL[stage]}
            {stage === "extracting" ? ` ${Math.round(progress * 100)}%` : ""}
          </span>
        </div>
      )}

      {errorMsg && <div className="error-box">{errorMsg}</div>}

      {cues.length > 0 && !busy && (
        <p className="muted small">
          ได้ {cues.length} ท่อน — ลากปรับตำแหน่ง/ความยาวบนไทม์ไลน์ได้เลย
        </p>
      )}
    </section>
  );
}
