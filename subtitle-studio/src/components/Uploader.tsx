import { useRef, useState } from "react";
import { useStore } from "../store";

const ACCEPT = "video/*,audio/*";

export default function Uploader() {
  const setVideoFile = useStore((s) => s.setVideoFile);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const onFiles = (files: FileList | null) => {
    const f = files?.[0];
    if (f) setVideoFile(f);
  };

  return (
    <div
      className={"uploader" + (dragging ? " dragging" : "")}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        onFiles(e.dataTransfer.files);
      }}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        hidden
        onChange={(e) => onFiles(e.target.files)}
      />
      <div className="uploader-inner">
        <div className="uploader-icon">🎬</div>
        <h2>ลากวิดีโอมาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์</h2>
        <p>
          รองรับไฟล์ขนาดใหญ่กว่า 100&nbsp;MB — ระบบจะดึง<strong>เฉพาะเสียง</strong>
          ออกมาถอดความ ตัววิดีโอไม่ถูกอัปโหลดไปไหน ทำงานในเครื่องคุณทั้งหมด
        </p>
        <span className="uploader-formats">MP4 · MOV · MKV · WEBM · M4A · MP3 …</span>
      </div>
    </div>
  );
}
