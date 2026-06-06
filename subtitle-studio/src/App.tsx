import { useCallback, useEffect, useRef, useState } from "react";
import { useStore } from "./store";
import { extractAudio, preloadFFmpeg } from "./lib/ffmpeg";
import { computeWaveform } from "./lib/waveform";
import { transcribe } from "./lib/gemini";
import Uploader from "./components/Uploader";
import VideoStage from "./components/VideoStage";
import Timeline from "./components/Timeline";
import ControlBar from "./components/ControlBar";
import TranscribePanel from "./components/TranscribePanel";
import Inspector from "./components/Inspector";
import StylePanel from "./components/StylePanel";
import SettingsModal from "./components/SettingsModal";

function fmtMB(bytes: number) {
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export default function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showSettings, setShowSettings] = useState(false);

  const videoUrl = useStore((s) => s.videoUrl);
  const videoFile = useStore((s) => s.videoFile);
  const isPlaying = useStore((s) => s.isPlaying);
  const setCurrentTime = useStore((s) => s.setCurrentTime);
  const clearVideo = useStore((s) => s.clearVideo);
  const removeCues = useStore((s) => s.removeCues);

  // Smoothly mirror the <video> clock into the store while playing.
  useEffect(() => {
    if (!isPlaying) return;
    let raf = 0;
    const tick = () => {
      const v = videoRef.current;
      if (v) setCurrentTime(v.currentTime);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isPlaying, setCurrentTime]);

  const runPipeline = useCallback(async () => {
    const st = useStore.getState();
    if (!st.videoFile) return;
    st.setError(null);
    try {
      let audio = st.audioBlob;
      if (!audio) {
        st.setStage("loading-ffmpeg");
        st.setProgress(0);
        await preloadFFmpeg();
        st.setStage("extracting");
        audio = await extractAudio(st.videoFile, (r) =>
          useStore.getState().setProgress(r)
        );
        st.setAudio(audio);
        st.setStage("decoding");
        try {
          const { peaks } = await computeWaveform(audio);
          st.setPeaks(peaks);
        } catch {
          /* waveform is a nice-to-have; ignore decode failures */
        }
      }
      st.setStage("transcribing");
      st.setProgress(0);
      const cues = await transcribe({
        apiKey: st.apiKey,
        model: st.model,
        wordsPerChunk: st.wordsPerChunk,
        audio,
      });
      if (cues.length === 0) {
        st.setError("ไม่พบเสียงพูดภาษาไทยในคลิปนี้");
        return;
      }
      st.setCues(cues);
      st.setStage("ready");
    } catch (e: any) {
      st.setError(e?.message || String(e));
    }
  }, []);

  // Global keyboard shortcuts (ignored while typing in a field).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (
        el &&
        (el.tagName === "INPUT" ||
          el.tagName === "TEXTAREA" ||
          el.tagName === "SELECT" ||
          el.isContentEditable)
      )
        return;
      if (e.code === "Space") {
        e.preventDefault();
        const v = videoRef.current;
        if (v) (v.paused ? v.play() : v.pause());
      } else if (e.key === "Delete" || e.key === "Backspace") {
        const ids = useStore.getState().selectedIds;
        if (ids.length) {
          e.preventDefault();
          removeCues(ids);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [removeCues]);

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          🎬 <strong>Subtitle&nbsp;Studio</strong>
          <span className="muted small">ถอดเสียงไทย · ตัดต่อซับสำหรับ Reels</span>
        </div>
        <div className="topbar-right">
          {videoFile && (
            <>
              <span className="filechip" title={videoFile.name}>
                {videoFile.name} · {fmtMB(videoFile.size)}
              </span>
              <button
                className="ghost"
                onClick={() => {
                  if (confirm("ล้างคลิปนี้และเริ่มใหม่?")) clearVideo();
                }}
              >
                🗑️ ล้างคลิป
              </button>
            </>
          )}
          <button className="ghost" onClick={() => setShowSettings(true)}>
            ⚙️ ตั้งค่า
          </button>
        </div>
      </header>

      {!videoUrl ? (
        <main className="empty-main">
          <Uploader />
        </main>
      ) : (
        <main className="editor">
          <div className="stage-col">
            <VideoStage videoRef={videoRef} />
          </div>
          <aside className="sidebar">
            <TranscribePanel
              onTranscribe={runPipeline}
              onOpenSettings={() => setShowSettings(true)}
            />
            <Inspector />
            <StylePanel />
          </aside>
          <div className="timeline-col">
            <ControlBar videoRef={videoRef} />
            <Timeline videoRef={videoRef} />
          </div>
        </main>
      )}

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  );
}
