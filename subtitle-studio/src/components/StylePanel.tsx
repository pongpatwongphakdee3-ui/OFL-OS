import { useStore } from "../store";

const WEIGHTS = [
  { v: 400, label: "ปกติ" },
  { v: 600, label: "กึ่งหนา" },
  { v: 700, label: "หนา" },
  { v: 800, label: "หนามาก" },
];

export default function StylePanel() {
  const { style, setStyle } = useStore();

  return (
    <section className="panel">
      <h3>3 · สไตล์ซับ (K2D)</h3>

      <label className="field">
        <span>น้ำหนักฟอนต์</span>
        <div className="chunk-row">
          {WEIGHTS.map((w) => (
            <button
              key={w.v}
              className={"chip" + (style.fontWeight === w.v ? " on" : "")}
              style={{ fontWeight: w.v }}
              onClick={() => setStyle({ fontWeight: w.v })}
            >
              {w.label}
            </button>
          ))}
        </div>
      </label>

      <label className="field">
        <span>ขนาด · {style.fontSizePct.toFixed(0)}</span>
        <input
          type="range"
          min={3}
          max={16}
          step={0.5}
          value={style.fontSizePct}
          onChange={(e) => setStyle({ fontSizePct: Number(e.target.value) })}
        />
      </label>

      <div className="time-row">
        <label className="field">
          <span>สีตัวอักษร</span>
          <input
            type="color"
            value={style.color}
            onChange={(e) => setStyle({ color: e.target.value })}
          />
        </label>
        <label className="field">
          <span>สีขอบ</span>
          <input
            type="color"
            value={style.strokeColor}
            onChange={(e) => setStyle({ strokeColor: e.target.value })}
          />
        </label>
      </div>

      <label className="field">
        <span>ความหนาขอบ · {style.strokeWidthPct.toFixed(0)}%</span>
        <input
          type="range"
          min={0}
          max={30}
          step={1}
          value={style.strokeWidthPct}
          onChange={(e) => setStyle({ strokeWidthPct: Number(e.target.value) })}
        />
      </label>

      <label className="field">
        <span>ระยะห่างอักษร · {style.letterSpacing}px</span>
        <input
          type="range"
          min={-2}
          max={12}
          step={0.5}
          value={style.letterSpacing}
          onChange={(e) => setStyle({ letterSpacing: Number(e.target.value) })}
        />
      </label>

      <div className="toggle-row">
        <label className="toggle">
          <input
            type="checkbox"
            checked={style.shadow}
            onChange={(e) => setStyle({ shadow: e.target.checked })}
          />
          เงา
        </label>
        <label className="toggle">
          <input
            type="checkbox"
            checked={style.uppercase}
            onChange={(e) => setStyle({ uppercase: e.target.checked })}
          />
          ตัวพิมพ์ใหญ่
        </label>
        <label className="toggle">
          <input
            type="checkbox"
            checked={style.bgEnabled}
            onChange={(e) => setStyle({ bgEnabled: e.target.checked })}
          />
          พื้นหลัง
        </label>
      </div>

      <label className="field">
        <span>ตำแหน่งแนวตั้ง</span>
        <div className="chunk-row">
          <button className="chip" onClick={() => setStyle({ posYPct: 16, posXPct: 50 })}>
            บน
          </button>
          <button className="chip" onClick={() => setStyle({ posYPct: 50, posXPct: 50 })}>
            กลาง
          </button>
          <button className="chip" onClick={() => setStyle({ posYPct: 78, posXPct: 50 })}>
            ล่าง
          </button>
        </div>
        <span className="muted small">หรือ ลากซับบนวิดีโอเพื่อวางเองได้</span>
      </label>
    </section>
  );
}
