"use client";
/**
 * AudioPanel — Browser-native Web Speech API.
 *
 * Why: backend Python TTS (gTTS/pyttsx3) kept failing due to Windows venv/
 * subprocess interpreter issues that were impossible to reliably fix from
 * outside the user's machine. The Web Speech API runs entirely in the
 * browser (Chrome, Edge, Safari) — zero backend dependency, zero pip
 * installs, zero environment issues. Works immediately, 100% free.
 */
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Mic, Loader2, Download, Volume2, AlertCircle, Info, CheckCircle2, Play, Pause, Square, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const TYPES = [
  { id: "short",    label: "Quick Overview", desc: "~1 min" },
  { id: "medium",   label: "Study Notes",    desc: "~3-5 min" },
  { id: "detailed", label: "Full Lecture",   desc: "~10+ min" },
];

export default function AudioPanel({ projectId }: { projectId: string }) {
  const [stype, setStype]         = useState("medium");
  const [loading, setLoading]     = useState(false);
  const [text, setText]           = useState<string | null>(null);
  const [error, setError]         = useState<string | null>(null);
  const [speaking, setSpeaking]   = useState(false);
  const [paused, setPaused]       = useState(false);
  const [voices, setVoices]       = useState<SpeechSynthesisVoice[]>([]);
  const [voiceIdx, setVoiceIdx]   = useState(0);
  const [rate, setRate]           = useState(1.0);
  const [showSettings, setShowSettings] = useState(false);
  const [supported, setSupported] = useState(true);
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Check browser support + load voices
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setSupported(false);
      return;
    }
    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices().filter(v => v.lang.startsWith("en"));
      setVoices(v.length ? v : window.speechSynthesis.getVoices());
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => { window.speechSynthesis.cancel(); };
  }, []);

  // Fetch the summary text to narrate
  const fetchText = async () => {
    setLoading(true); setError(null); setText(null);
    try {
      const res = await fetch(`${API}/api/summary/${projectId}?summary_type=${stype}`);
      const summaries = await res.json();
      if (Array.isArray(summaries) && summaries.length > 0) {
        const content = summaries[0].content as string;
        const clean = content.replace(/#+\s*/g, "").replace(/\*+/g, "").replace(/•\s*/g, "").replace(/\s+/g, " ").trim();
        setText(clean);
      } else {
        setError(`No "${TYPES.find(t=>t.id===stype)?.label}" summary found. Generate it first in the Summary tab.`);
      }
    } catch {
      setError("Could not load summary. Check the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const speak = () => {
    if (!text || typeof window === "undefined") return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    if (voices[voiceIdx]) utter.voice = voices[voiceIdx];
    utter.rate = rate;
    utter.pitch = 1.0;
    utter.onstart = () => { setSpeaking(true); setPaused(false); };
    utter.onend   = () => { setSpeaking(false); setPaused(false); };
    utter.onerror = () => { setSpeaking(false); setPaused(false); setError("Playback error — try again."); };
    utterRef.current = utter;
    window.speechSynthesis.speak(utter);
  };

  const pauseResume = () => {
    if (!window.speechSynthesis) return;
    if (paused) { window.speechSynthesis.resume(); setPaused(false); }
    else { window.speechSynthesis.pause(); setPaused(true); }
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setSpeaking(false); setPaused(false);
  };

  // Record the narration to a downloadable audio file using MediaRecorder + an oscillator-free
  // approach: we play through speechSynthesis while capturing system audio is not possible
  // cross-browser without extra permissions, so we offer a clear explanation instead.
  const downloadInfo = () => {
    alert(
      "Browser TTS plays live audio and can't be saved as a file directly from JavaScript " +
      "(browser security restriction). To save an MP3:\n\n" +
      "1. Use Windows: Win+Alt+R to record your screen audio while it plays\n" +
      "2. Or use a free online text-to-speech site and paste the summary text\n\n" +
      "Playback in-app (this page) works immediately with no setup."
    );
  };

  if (!supported) {
    return (
      <div className="max-w-2xl">
        <div className="flex gap-2 bg-error/10 border border-error/20 rounded-xl px-4 py-4">
          <AlertCircle className="w-5 h-5 dark:text-error flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm dark:text-error font-semibold mb-1">Browser not supported</p>
            <p className="text-xs dark:text-error/70">
              Your browser doesn't support speech synthesis. Please use Chrome, Edge, or Safari.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl dark:bg-accent/15 flex items-center justify-center">
            <Mic className="w-5 h-5 dark:text-accent" />
          </div>
          <div>
            <h2 className="text-xl font-bold accent-gradient bg-clip-text text-transparent">
              Audio Narration
            </h2>
            <p className="text-xs dark:text-dark-text-muted">Instant browser-based text-to-speech · 100% free, no setup</p>
          </div>
        </div>
        <button onClick={() => setShowSettings(s => !s)}
          className="flex items-center gap-1.5 text-xs dark:text-dark-text-muted hover:text-text-primary dark:hover:text-dark-text-primary dark:bg-dark-bg-secondary hover:dark:bg-dark-bg-hover px-3 py-2 rounded-xl transition-all flex-shrink-0">
          <Settings2 className="w-3.5 h-3.5" /> Voice Settings
        </button>
      </div>

      {showSettings && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
          className="mb-5 bg-bg-card dark:bg-dark-bg-card dark:border-dark-border dark:border-dark-border shadow-card border dark:border-dark-border rounded-xl p-4 space-y-4 overflow-hidden">
          <div>
            <p className="text-xs dark:text-dark-text-secondary uppercase tracking-wider mb-2">Voice</p>
            <select value={voiceIdx} onChange={e => setVoiceIdx(Number(e.target.value))}
              className="w-full dark:bg-dark-bg-secondary border dark:border-dark-border dark:text-dark-text-primary rounded-lg px-3 py-2 text-sm outline-none">
              {voices.map((v, i) => (
                <option key={i} value={i}>{v.name} ({v.lang})</option>
              ))}
            </select>
          </div>
          <div>
            <p className="text-xs dark:text-dark-text-secondary uppercase tracking-wider mb-2">Speed: {rate.toFixed(1)}x</p>
            <input type="range" min={0.5} max={2} step={0.1} value={rate}
              onChange={e => setRate(Number(e.target.value))} className="w-full accent-accent" />
          </div>
        </motion.div>
      )}

      <div className="flex gap-2 dark:dark:bg-accent/10 border border-accent/20 rounded-xl px-4 py-3 mb-5">
        <Info className="w-4 h-4 dark:text-accent flex-shrink-0 mt-0.5" />
        <p className="text-xs dark:text-accent/80 leading-relaxed">
          Uses your browser's built-in voice engine — works instantly, no backend or Python packages needed.
          Needs a summary generated first (Summary tab).
        </p>
      </div>

      <div className="space-y-2 mb-6">
        {TYPES.map(t => (
          <button key={t.id} onClick={() => { setStype(t.id); setText(null); stop(); }}
            className={cn("w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border text-left transition-all",
              stype === t.id ? "bg-accent/10 border-accent/30 text-accent" : "bg-bg-secondary dark:bg-dark-bg-secondary border-border dark:border-dark-border text-text-muted dark:text-dark-text-muted hover:text-text-primary dark:hover:text-dark-text-primary")}>
            <div className={cn("w-2.5 h-2.5 rounded-full", stype === t.id ? "bg-accent" : "bg-text-disabled dark:bg-dark-text-disabled")} />
            <div><p className="text-sm font-medium text-text-primary dark:text-dark-text-primary">{t.label}</p><p className="text-xs text-text-muted dark:text-dark-text-muted">{t.desc}</p></div>
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 flex gap-2 bg-error/10 border border-error/20 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 dark:text-error flex-shrink-0 mt-0.5" />
          <p className="text-xs dark:text-error">{error}</p>
        </div>
      )}

      {!text ? (
        <button onClick={fetchText} disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white font-semibold py-3.5 rounded-xl transition-all disabled:opacity-50">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Loading…</> : <><Volume2 className="w-4 h-4" /> Load & Prepare Narration</>}
        </button>
      ) : (
        <div className="bg-bg-card dark:bg-dark-bg-card dark:border-dark-border dark:border-dark-border shadow-card border dark:border-dark-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-4 h-4 text-success" />
            <p className="text-sm font-semibold text-text-primary dark:text-dark-text-primary">Ready to play · {text.split(" ").length} words</p>
          </div>

          <div className="flex gap-2 mb-4">
            {!speaking ? (
              <button onClick={speak}
                className="flex-1 flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white font-medium py-3 rounded-xl transition-all">
                <Play className="w-4 h-4 fill-white" /> Play Narration
              </button>
            ) : (
              <>
                <button onClick={pauseResume}
                  className="flex-1 flex items-center justify-center gap-2 bg-warning hover:bg-warning/90 text-white font-medium py-3 rounded-xl transition-all">
                  {paused ? <><Play className="w-4 h-4 fill-white" /> Resume</> : <><Pause className="w-4 h-4" /> Pause</>}
                </button>
                <button onClick={stop}
                  className="flex items-center justify-center gap-2 bg-error hover:bg-error/90 text-white font-medium py-3 px-5 rounded-xl transition-all">
                  <Square className="w-4 h-4" />
                </button>
              </>
            )}
          </div>

          <button onClick={downloadInfo}
            className="w-full flex items-center justify-center gap-2 text-xs dark:text-dark-text-secondary hover:dark:text-dark-text-secondary py-2 transition-colors">
            <Download className="w-3.5 h-3.5" /> How to save as a file
          </button>

          <div className="mt-4 dark:bg-dark-bg-secondary/40 rounded-xl p-4 max-h-40 overflow-y-auto">
            <p className="text-xs dark:text-dark-text-muted leading-relaxed">{text}</p>
          </div>
        </div>
      )}
    </div>
  );
}
