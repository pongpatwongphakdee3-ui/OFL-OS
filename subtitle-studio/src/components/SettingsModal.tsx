import { useState } from "react";
import { useStore } from "../store";
import { GEMINI_MODELS } from "../lib/gemini";

export default function SettingsModal({ onClose }: { onClose: () => void }) {
  const { apiKey, model, setApiKey, setModel } = useStore();
  const [localKey, setLocalKey] = useState(apiKey);
  const [show, setShow] = useState(false);

  const save = () => {
    setApiKey(localKey.trim());
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>ตั้งค่า Gemini</h2>
        <p className="muted">
          คีย์จะถูกเก็บไว้ใน <code>localStorage</code> ของเบราว์เซอร์นี้เท่านั้น
          ไม่ถูกส่งไปที่เซิร์ฟเวอร์ใด ๆ นอกจาก Google
        </p>

        <label className="field">
          <span>Gemini API Key</span>
          <div className="key-row">
            <input
              type={show ? "text" : "password"}
              value={localKey}
              placeholder="AIza…"
              onChange={(e) => setLocalKey(e.target.value)}
              autoFocus
            />
            <button className="ghost" onClick={() => setShow((s) => !s)}>
              {show ? "ซ่อน" : "แสดง"}
            </button>
          </div>
          <a
            className="muted link"
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noreferrer"
          >
            ขอ API key ฟรีที่ Google AI Studio →
          </a>
        </label>

        <label className="field">
          <span>โมเดล</span>
          <select value={model} onChange={(e) => setModel(e.target.value)}>
            {GEMINI_MODELS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>

        <div className="modal-actions">
          <button className="ghost" onClick={onClose}>
            ยกเลิก
          </button>
          <button className="primary" onClick={save}>
            บันทึก
          </button>
        </div>
      </div>
    </div>
  );
}
