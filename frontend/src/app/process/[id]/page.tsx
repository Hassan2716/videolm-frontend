"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, Circle, ArrowLeft, ArrowRight, AlertCircle } from "lucide-react";
import { getProject } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { Project } from "@/types";
import Link from "next/link";

const STAGES = [
  { key: "download",   label: "Download",    icon: "⬇️",  keywords: ["download","input","queued"] },
  { key: "audio",      label: "Audio",       icon: "🎵",  keywords: ["audio","extract"] },
  { key: "transcribe", label: "Transcribe",  icon: "🎙️", keywords: ["whisper","transcrib"] },
  { key: "frames",     label: "Frames",      icon: "🎬",  keywords: ["frame","keyframe","scene"] },
  { key: "caption",    label: "Captions",    icon: "🖼️", keywords: ["caption","blip","visual"] },
  { key: "nlp",        label: "NLP",         icon: "🧠",  keywords: ["nlp","chunk","process"] },
  { key: "summary",    label: "Summaries",   icon: "📝",  keywords: ["summar"] },
  { key: "index",      label: "Index",       icon: "🔍",  keywords: ["index","search","faiss"] },
];

function getStageIdx(stage: string) {
  const s = stage.toLowerCase();
  for (let i = 0; i < STAGES.length; i++) {
    if (STAGES[i].keywords.some(k => s.includes(k))) return i;
  }
  if (s.includes("complete")) return STAGES.length;
  return 0;
}

export default function ProcessPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    let stopped = false;
    const poll = async () => {
      while (!stopped) {
        try {
          const p = await getProject(id);
          setProject(p);
          if (p.status === "complete") {
            setTimeout(() => router.push(`/results/${id}`), 1500);
            return;
          }
          if (p.status === "failed") {
            setError(p.error_message || "Processing failed");
            return;
          }
        } catch { setError("Connection lost"); return; }
        await new Promise(r => setTimeout(r, 1500));
      }
    };
    poll();
    return () => { stopped = true; };
  }, [id, router]);

  if (error) return (
    <div className="min-h-screen bg-bg-primary dark:bg-dark-bg-primary flex items-center justify-center">
      <div className="glass rounded-2xl p-12 max-w-md text-center">
        <AlertCircle className="w-12 h-12 text-error mx-auto mb-4" />
        <h2 className="text-xl font-bold text-text-primary dark:text-dark-text-primary mb-3">Processing Failed</h2>
        <p className="text-text-muted dark:text-dark-text-muted text-sm mb-6">{error}</p>
        <Link href="/dashboard" className="flex items-center justify-center gap-2 text-sm text-accent hover:text-accent-hover">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </div>
    </div>
  );

  const activeIdx = project ? getStageIdx(project.current_stage) : -1;

  return (
    <div className="min-h-screen bg-bg-primary dark:bg-dark-bg-primary flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <Link href="/dashboard" className="flex items-center gap-1.5 text-xs text-text-muted dark:text-dark-text-muted hover:text-text-primary dark:hover:text-dark-text-primary mb-8 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
        </Link>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-xl font-bold gradient-text mb-1">Analyzing Video</h1>
              {project && <p className="text-sm text-text-muted dark:text-dark-text-muted truncate max-w-sm">{project.source_url || project.source_filename}</p>}
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-text-primary dark:text-dark-text-primary">{project?.progress ?? 0}%</div>
              <div className="text-[10px] text-text-muted dark:text-dark-text-muted uppercase tracking-wider">Progress</div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-2 bg-bg-hover dark:bg-dark-bg-hover rounded-full overflow-hidden mb-8">
            <motion.div
              className="h-full bg-accent rounded-full shimmer-bar"
              animate={{ width: `${project?.progress ?? 0}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          {/* Stage cards */}
          <div className="grid grid-cols-4 gap-3">
            {STAGES.map((stage, i) => {
              const done = i < activeIdx;
              const active = i === activeIdx && project?.status === "processing";
              return (
                <div key={stage.key} className={cn(
                  "rounded-xl p-3 border text-center transition-all",
                  done   && "bg-success/5 border-success/20",
                  active && "bg-accent/10 border-accent/30",
                  !done && !active && "bg-bg-card dark:bg-dark-bg-card border-border dark:border-dark-border opacity-35"
                )}>
                  <div className="text-lg mb-1">{stage.icon}</div>
                  <p className={cn("text-[11px] font-semibold",
                    done && "text-success", active && "text-accent", !done && !active && "text-text-disabled dark:text-dark-text-disabled"
                  )}>{stage.label}</p>
                  <div className="flex justify-center mt-1">
                    {done   ? <CheckCircle2 className="w-3 h-3 text-success" /> :
                     active ? <Loader2 className="w-3 h-3 text-accent animate-spin" /> :
                              <Circle className="w-3 h-3 text-text-disabled dark:text-dark-text-disabled" />}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Current stage label */}
          <div className="mt-6 flex items-center gap-2 bg-accent/8 border border-accent/15 rounded-xl px-4 py-3">
            <Loader2 className="w-4 h-4 text-accent animate-spin flex-shrink-0" />
            <p className="text-sm text-accent">{project?.current_stage || "Initializing…"}</p>
          </div>

          {project?.status === "complete" && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="mt-5 flex items-center justify-between bg-success/8 border border-success/20 rounded-xl px-5 py-4">
              <div>
                <p className="font-semibold text-success">Analysis Complete!</p>
                <p className="text-sm text-text-muted dark:text-dark-text-muted">Redirecting to results…</p>
              </div>
              <button onClick={() => router.push(`/results/${id}`)}
                className="flex items-center gap-2 bg-success hover:bg-success/90 text-white text-sm font-medium px-4 py-2 rounded-xl">
                View Results <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
