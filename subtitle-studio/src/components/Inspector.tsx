import { useStore } from "../store";
import { fmtClock } from "../lib/time";

export default function Inspector() {
  const {
    cues,
    selectedIds,
    currentTime,
    updateCue,
    removeCues,
    addCueAt,
    splitSelectedAt,
    mergeSelected,
  } = useStore();

  const selected = cues.filter((c) => selectedIds.includes(c.id));
  const one = selected.length === 1 ? selected[0] : null;

  return (
    <section className="panel">
      <h3>2 · แก้ไขซับ</h3>

      <div className="btn-grid">
        <button className="ghost" onClick={() => addCueAt(currentTime)}>
          ➕ เพิ่มท่อน
        </button>
        <button
          className="ghost"
          disabled={selected.length === 0}
          onClick={() => splitSelectedAt(currentTime)}
          title="ตัดท่อนที่หัวเล่นอยู่"
        >
          ✂️ ตัด (ที่หัวเล่น)
        </button>
        <button
          className="ghost"
          disabled={selected.length < 2}
          onClick={mergeSelected}
        >
          🔗 รวมท่อน
        </button>
        <button
          className="ghost danger"
          disabled={selected.length === 0}
          onClick={() => removeCues(selectedIds)}
        >
          🗑️ ลบ
        </button>
      </div>

      {one ? (
        <>
          <label className="field">
            <span>ข้อความ</span>
            <textarea
              value={one.text}
              rows={2}
              onChange={(e) => updateCue(one.id, { text: e.target.value })}
            />
          </label>
          <div className="time-row">
            <label className="field">
              <span>เริ่ม (วิ)</span>
              <input
                type="number"
                step={0.05}
                value={one.start.toFixed(2)}
                onChange={(e) =>
                  updateCue(one.id, {
                    start: Math.min(Number(e.target.value), one.end - 0.1),
                  })
                }
              />
            </label>
            <label className="field">
              <span>จบ (วิ)</span>
              <input
                type="number"
                step={0.05}
                value={one.end.toFixed(2)}
                onChange={(e) =>
                  updateCue(one.id, {
                    end: Math.max(Number(e.target.value), one.start + 0.1),
                  })
                }
              />
            </label>
          </div>
        </>
      ) : selected.length > 1 ? (
        <p className="muted small">
          เลือกอยู่ {selected.length} ท่อน — ลากบนไทม์ไลน์เพื่อย้ายพร้อมกัน หรือกด “รวมท่อน”
        </p>
      ) : (
        <p className="muted small">
          คลิกเลือกท่อนบนไทม์ไลน์ (กด Shift เพื่อเลือกหลายท่อน, ลากพื้นที่ว่างเพื่อคลุมเลือก) ·
          ดับเบิลคลิกท่อนเพื่อแก้ข้อความเร็ว ๆ
        </p>
      )}

      {one && (
        <p className="muted small">
          ความยาว {fmtClock(one.end - one.start).replace("0:", "")} วิ
        </p>
      )}
    </section>
  );
}
