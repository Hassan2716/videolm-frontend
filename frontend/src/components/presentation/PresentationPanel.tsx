"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layout, Loader2, Download, Sparkles, Check, AlertCircle, FileDown, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const THEMES = [
  { id:"modern",    label:"Modern",    color:"#3b82f6" },
  { id:"academic",  label:"Academic",  color:"#1e3a8a" },
  { id:"corporate", label:"Corporate", color:"#374151" },
  { id:"dark",      label:"Dark",      color:"#7c3aed" },
  { id:"light",     label:"Light",     color:"#10b981" },
  { id:"minimal",   label:"Minimal",   color:"#6b7280" },
  { id:"ai",        label:"AI Theme",  color:"#22d3ee" },
];

const SLIDE_COUNTS = [5, 8, 10, 12, 15, 20];

export default function PresentationPanel({ projectId }: { projectId: string }) {
  const [numSlides, setNumSlides]   = useState(10);
  const [customSlides, setCustom]   = useState("");
  const [theme, setTheme]           = useState("modern");
  const [sumType, setSumType]       = useState("medium");
  const [includeImages, setImages]  = useState(true);
  const [jobId, setJobId]           = useState<string|null>(null);
  const [status, setStatus]         = useState<"idle"|"running"|"complete"|"failed">("idle");
  const [progress, setProgress]     = useState(0);
  const [message, setMessage]       = useState("");
  const [filename, setFilename]     = useState<string|null>(null);
  const [error, setError]           = useState<string|null>(null);
  const [isPptxError, setIsPptxError] = useState(false);

  useEffect(() => {
    if (!jobId) return;
    const iv = setInterval(async () => {
      try {
        const res = await fetch(`${API}/api/presentation/status/${jobId}`);
        const job = await res.json();
        setProgress(job.progress || 0);
        setMessage(job.message || "");
        if (job.status === "complete") {
          setStatus("complete");
          setFilename(job.result?.filename || null);
          clearInterval(iv);
        } else if (job.status === "failed") {
          setStatus("failed");
          const errMsg = job.error || "Generation failed";
          setError(errMsg);
          setIsPptxError(errMsg.includes("pptx") || errMsg.includes("python-pptx"));
          clearInterval(iv);
        }
      } catch { clearInterval(iv); setStatus("failed"); setError("Connection error"); }
    }, 1500);
    return () => clearInterval(iv);
  }, [jobId]);

  const generate = async () => {
    setStatus("running"); setProgress(0); setError(null);
    setFilename(null); setIsPptxError(false);
    const slides = customSlides ? parseInt(customSlides) || numSlides : numSlides;
    try {
      const res = await fetch(`${API}/api/presentation/${projectId}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ num_slides: slides, theme, include_images: includeImages, summary_type: sumType }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const { job_id } = await res.json();
      setJobId(job_id);
    } catch (e) {
      setStatus("failed");
      setError(e instanceof Error ? e.message : "Failed to start");
    }
  };

  const downloadUrl = filename ? `${API}/api/presentation/${projectId}/download/${filename}` : null;
  const totalSlides = customSlides ? parseInt(customSlides) || numSlides : numSlides;
  const activeTheme = THEMES.find(t => t.id === theme)!;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center">
          <Layout className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h2 className="text-xl font-bold accent-gradient">
            AI Presentation Generator
          </h2>
          <p className="text-xs text-text-muted dark:text-dark-text-muted">Generates complete PPTX from your video content · Needs a summary first</p>
        </div>
      </div>

      {/* python-pptx install notice */}
      {isPptxError && (
        <div className="mb-6 bg-warning/8 border border-warning/25 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4 text-warning" />
            <p className="text-sm font-semibold text-warning">python-pptx not installed in your server Python</p>
          </div>
          <p className="text-xs text-text-muted dark:text-dark-text-muted mb-3">Run this command in your terminal (the same Python your backend uses):</p>
          <div className="bg-bg-primary dark:bg-dark-bg-primary rounded-xl px-4 py-3 font-mono text-xs text-success select-all mb-3">
            C:\Users\LENOVO\AppData\Local\Programs\Python\Python311\python.exe -m pip install python-pptx
          </div>
          <p className="text-xs text-text-disabled dark:text-dark-text-disabled">Then restart the backend and try again.</p>
        </div>
      )}

      <div className="grid lg:grid-cols-[1fr_300px] gap-6">
        <div className="space-y-5">
          {/* Slide count */}
          <div>
            <p className="text-xs text-text-muted dark:text-dark-text-muted uppercase tracking-wider font-semibold mb-3">Number of Slides</p>
            <div className="flex flex-wrap gap-2 mb-2">
              {SLIDE_COUNTS.map(n => (
                <button key={n} onClick={() => { setNumSlides(n); setCustom(""); }}
                  className={cn("px-4 py-2 rounded-xl text-sm font-semibold transition-all border",
                    numSlides === n && !customSlides
                      ? "bg-accent/20 border-accent/40 text-accent"
                      : "bg-bg-secondary dark:bg-dark-bg-secondary border-border dark:border-dark-border text-text-muted dark:text-dark-text-muted hover:text-text-primary dark:hover:text-dark-text-primary")}>
                  {n}
                </button>
              ))}
            </div>
            <input
              value={customSlides}
              onChange={e => setCustom(e.target.value.replace(/\D/g, ''))}
              placeholder="Or type a custom number…"
              className="bg-bg-secondary dark:bg-dark-bg-secondary border border-border dark:border-dark-border focus:border-accent/50 rounded-xl px-4 py-2 text-sm text-text-primary dark:text-dark-text-primary placeholder:text-text-muted dark:placeholder:text-dark-text-muted outline-none w-48"
            />
          </div>

          {/* Theme */}
          <div>
            <p className="text-xs text-text-muted dark:text-dark-text-muted uppercase tracking-wider font-semibold mb-3">Theme</p>
            <div className="grid grid-cols-4 gap-2">
              {THEMES.map(t => (
                <button key={t.id} onClick={() => setTheme(t.id)}
                  className={cn("flex flex-col items-center gap-2 p-3 rounded-xl border transition-all",
                    theme === t.id ? "text-text-primary dark:text-dark-text-primary" : "bg-bg-secondary dark:bg-dark-bg-secondary border-border dark:border-dark-border text-text-muted dark:text-dark-text-muted hover:text-text-secondary dark:hover:text-dark-text-secondary")}
                  style={theme === t.id ? { borderColor: t.color+"60", background: t.color+"18" } : {}}>
                  <div className="w-8 h-4 rounded" style={{ background: t.color+"50", border: `1px solid ${t.color}60` }}/>
                  <span className="text-[11px] font-semibold">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content source */}
          <div>
            <p className="text-xs text-text-muted dark:text-dark-text-muted uppercase tracking-wider font-semibold mb-3">Content Source (generate a summary first)</p>
            <div className="flex gap-2">
              {[{id:"short",label:"Short"},{id:"medium",label:"Medium"},{id:"detailed",label:"Detailed"}].map(s => (
                <button key={s.id} onClick={() => setSumType(s.id)}
                  className={cn("px-4 py-2 rounded-xl text-xs font-medium transition-all border",
                    sumType === s.id ? "bg-accent/20 border-accent/30 text-accent"
                                     : "bg-bg-secondary dark:bg-dark-bg-secondary border-border dark:border-dark-border text-text-muted dark:text-dark-text-muted hover:text-text-secondary dark:hover:text-dark-text-secondary")}>
                  {s.label} Summary
                </button>
              ))}
            </div>
          </div>

          {/* Include images */}
          <button onClick={() => setImages(!includeImages)}
            className={cn("flex items-center gap-3 px-4 py-3 rounded-xl border transition-all",
              includeImages ? "bg-success/10 border-success/30 text-success"
                            : "bg-bg-secondary dark:bg-dark-bg-secondary border-border dark:border-dark-border text-text-muted dark:text-dark-text-muted")}>
            <span className="text-lg">{includeImages ? "🖼️" : "📄"}</span>
            <span className="text-sm font-medium">
              {includeImages ? "Include video keyframes in slides" : "Text-only slides (no images)"}
            </span>
          </button>
        </div>

        {/* Right panel */}
        <div className="flex flex-col gap-4">
          {/* Preview mock */}
          <div className="bg-bg-secondary dark:bg-dark-bg-secondary border border-border dark:border-dark-border rounded-2xl p-5">
            <p className="text-xs text-text-muted dark:text-dark-text-muted uppercase tracking-wider font-semibold mb-3">Preview</p>
            <div className="rounded-xl overflow-hidden border border-border dark:border-dark-border aspect-video relative"
              style={{ background: `rgb(${theme === "modern" ? "15,23,42" : theme === "dark" ? "9,9,11" : theme === "ai" ? "2,6,23" : "255,255,255"})` }}>
              <div className="absolute inset-0 p-4 flex flex-col">
                <div className="w-1 h-full absolute left-0 top-0 rounded-r" style={{ background: activeTheme.color }} />
                <div className="h-2.5 rounded w-2/3 mb-2 ml-2" style={{ background: activeTheme.color + "80" }} />
                <div className="h-px rounded w-5/6 mb-3 ml-2 opacity-30" style={{ background: activeTheme.color }} />
                {[80,65,50].map((w,i) => (
                  <div key={i} className="h-1 rounded mb-1.5 ml-2 opacity-20 bg-white" style={{ width: `${w}%` }} />
                ))}
              </div>
              <div className="absolute bottom-2 right-2 text-[9px] font-mono opacity-30 text-white">
                {totalSlides} slides
              </div>
            </div>

            <div className="mt-3 space-y-1.5 text-xs">
              {[
                { l: "Slides",   v: totalSlides },
                { l: "Theme",    v: activeTheme.label },
                { l: "Images",   v: includeImages ? "Yes" : "No" },
                { l: "Source",   v: sumType + " summary" },
              ].map(r => (
                <div key={r.l} className="flex justify-between text-text-muted dark:text-dark-text-muted">
                  <span>{r.l}</span>
                  <span className="text-text-primary dark:text-dark-text-primary font-medium capitalize">{r.v}</span>
                </div>
              ))}
            </div>
          </div>

          <button onClick={generate} disabled={status === "running"}
            className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white font-semibold py-3.5 rounded-xl transition-all disabled:opacity-50">
            {status === "running"
              ? <><Loader2 className="w-4 h-4 animate-spin" />Generating… {progress}%</>
              : <><Sparkles className="w-4 h-4" />Generate Presentation</>}
          </button>

          {status === "running" && (
            <div>
              <div className="h-1.5 bg-bg-hover dark:bg-dark-bg-hover rounded-full overflow-hidden">
                <motion.div className="h-full bg-accent rounded-full"
                  animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} />
              </div>
              <p className="text-xs text-text-muted dark:text-dark-text-muted mt-1.5">{message}</p>
            </div>
          )}

          <AnimatePresence>
            {status === "complete" && downloadUrl && (
              <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} className="space-y-2">
                <div className="flex items-center gap-2 text-success text-sm bg-success/10 border border-success/20 rounded-xl px-4 py-3">
                  <Check className="w-4 h-4" /> Presentation ready!
                </div>
                <a href={downloadUrl} download={filename || "presentation.pptx"}
                  className="flex items-center justify-center gap-2 bg-success hover:bg-success/90 text-white font-semibold py-3 rounded-xl transition-all text-sm">
                  <FileDown className="w-4 h-4" /> Download PPTX
                </a>
              </motion.div>
            )}
          </AnimatePresence>

          {status === "failed" && error && !isPptxError && (
            <div className="flex gap-2 bg-error/8 border border-error/20 rounded-xl px-4 py-3">
              <AlertCircle className="w-4 h-4 text-error flex-shrink-0 mt-0.5" />
              <p className="text-xs text-error">{error}</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
