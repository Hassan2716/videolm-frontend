"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Copy, Check, Download, X } from "lucide-react";
import type { Transcript } from "@/types";
export default function TranscriptPanel({ transcript }: { transcript: Transcript | null }) {
  const [search, setSearch] = useState(""); const [copied, setCopied] = useState(false);
  if (!transcript) return <div className="flex flex-col items-center justify-center py-20 text-center"><div className="text-4xl mb-3 opacity-50">📝</div><p className="text-text-muted dark:text-dark-text-muted text-sm font-medium">Transcript not available</p><p className="text-text-disabled dark:text-dark-text-disabled text-xs mt-1">The transcript may still be processing</p></div>;
  const filtered = transcript.segments.filter(s => !search || s.text.toLowerCase().includes(search.toLowerCase()));
  const copy = () => { navigator.clipboard.writeText(transcript.full_text); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const dl = () => {
    const c = transcript.segments.map(s => { const m=Math.floor(s.start/60),sec=Math.floor(s.start%60); return `[${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}] ${s.text.trim()}`; }).join("\n");
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([c],{type:"text/plain"})); a.download = "transcript.txt"; a.click();
  };
  return (
    <motion.div initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-text-primary dark:text-dark-text-primary">Transcript</h2>
          <p className="text-xs text-text-muted dark:text-dark-text-muted mt-0.5">{transcript.word_count.toLocaleString()} words · {transcript.language.toUpperCase()}{search ? ` · ${filtered.length} matches` : ""}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={copy} className="flex items-center gap-1.5 text-xs text-text-muted dark:text-dark-text-muted hover:text-text-primary dark:hover:text-dark-text-primary bg-bg-hover dark:bg-dark-bg-hover px-3 py-1.5 rounded-lg transition-all">
            {copied ? <><Check className="w-3.5 h-3.5 text-success"/>Copied</> : <><Copy className="w-3.5 h-3.5"/>Copy All</>}
          </button>
          <button onClick={dl} className="flex items-center gap-1.5 text-xs text-text-muted dark:text-dark-text-muted hover:text-text-primary dark:hover:text-dark-text-primary bg-bg-hover dark:bg-dark-bg-hover px-3 py-1.5 rounded-lg transition-all"><Download className="w-3.5 h-3.5"/>Download</button>
        </div>
      </div>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted dark:text-dark-text-muted"/>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search transcript…"
          className="w-full bg-bg-secondary dark:bg-dark-bg-secondary border border-border dark:border-dark-border focus:border-accent/50 rounded-xl pl-10 pr-10 py-2.5 text-sm text-text-primary dark:text-dark-text-primary placeholder:text-text-muted dark:placeholder:text-dark-text-muted outline-none transition-colors"/>
        {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted dark:text-dark-text-muted hover:text-text-primary dark:hover:text-dark-text-primary"><X className="w-4 h-4"/></button>}
      </div>
      <div className="bg-bg-secondary dark:bg-dark-bg-secondary/40 border border-border dark:border-dark-border rounded-2xl p-5 max-h-[65vh] overflow-y-auto space-y-1">
        {filtered.map((seg, i) => {
          const m=Math.floor(seg.start/60),s=Math.floor(seg.start%60);
          return (
            <div key={i} className="flex gap-3 hover:bg-bg-card dark:bg-dark-bg-card px-2 py-2 rounded-xl transition-colors group">
              <span className="text-xs font-mono text-accent/70 group-hover:text-accent flex-shrink-0 mt-0.5 min-w-[42px]">{String(m).padStart(2,"0")}:{String(s).padStart(2,"0")}</span>
              <p className="text-sm text-text-secondary dark:text-dark-text-secondary leading-relaxed">
                {search ? seg.text.split(new RegExp(`(${search})`,"gi")).map((p,j) =>
                  p.toLowerCase()===search.toLowerCase() ? <mark key={j} className="bg-warning/25 text-warning rounded px-0.5">{p}</mark> : p
                ) : seg.text}
              </p>
            </div>
          );
        })}
        {filtered.length===0 && <div className="flex flex-col items-center py-8 text-center"><div className="text-3xl mb-2 opacity-50">🔍</div><p className="text-text-muted dark:text-dark-text-muted text-sm">No matches for "{search}"</p></div>}
      </div>
    </motion.div>
  );
}
