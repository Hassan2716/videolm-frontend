"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, X, Download, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Frame } from "@/types";
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const TC: Record<string,{bg:string;text:string;border:string}> = {
  chart:{bg:"rgba(37,99,235,0.15)",text:"#60a5fa",border:"rgba(37,99,235,0.3)"},
  table:{bg:"rgba(16,185,129,0.15)",text:"#34d399",border:"rgba(16,185,129,0.3)"},
  diagram:{bg:"rgba(245,158,11,0.15)",text:"#fbbf24",border:"rgba(245,158,11,0.3)"},
  graph:{bg:"rgba(168,85,247,0.15)",text:"#c084fc",border:"rgba(168,85,247,0.3)"},
  slide:{bg:"rgba(239,68,68,0.15)",text:"#f87171",border:"rgba(239,68,68,0.3)"},
  unknown:{bg:"rgba(100,116,139,0.15)",text:"#94a3b8",border:"rgba(100,116,139,0.3)"},
};
export default function FramesPanel({ frames }: { frames: Frame[] }) {
  const [selected, setSelected] = useState<Frame|null>(null);
  const [filter, setFilter] = useState("all"); const [search, setSearch] = useState("");
  const filtered = frames.filter(f => (filter==="all"||f.visual_type===filter) && (!search||[f.caption,f.ocr_text,f.visual_type].some(s=>s?.toLowerCase().includes(search.toLowerCase()))));
  const types = ["all",...Array.from(new Set(frames.map(f=>f.visual_type||"unknown")))];
  return (
    <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}>
      <div className="flex items-center justify-between mb-5">
        <div><h2 className="text-xl font-bold text-text-primary dark:text-dark-text-primary">Key Frames</h2><p className="text-xs text-text-muted dark:text-dark-text-muted mt-0.5">{filtered.length} of {frames.length} frames</p></div>
      </div>
      <div className="flex flex-col md:flex-row gap-3 mb-5">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted dark:text-dark-text-muted"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search captions, OCR…" className="w-full bg-bg-secondary dark:bg-dark-bg-secondary border border-border dark:border-dark-border focus:border-accent/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-text-primary dark:text-dark-text-primary placeholder:text-text-muted dark:placeholder:text-dark-text-muted outline-none"/></div>
        <div className="flex gap-1.5 flex-wrap">
          {types.map(t=>{const cfg=TC[t]||TC.unknown;const active=filter===t;return(
            <button key={t} onClick={()=>setFilter(t)} className="px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all border"
              style={active?{background:cfg.bg,color:cfg.text,borderColor:cfg.border}:{background:"transparent",color:"#64748b",borderColor:"rgba(15,23,42,0.1)"}}>
              {t} ({t==="all"?frames.length:frames.filter(f=>(f.visual_type||"unknown")===t).length})
            </button>);})}
        </div>
      </div>
      {filtered.length===0?<div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-4xl mb-3 opacity-50">🎬</div>
        <p className="text-text-muted dark:text-dark-text-muted text-sm font-medium">No frames match your filter</p>
        <p className="text-text-disabled dark:text-dark-text-disabled text-xs mt-1">Try a different filter or search term</p>
      </div>:(
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((frame,i)=>{const cfg=TC[frame.visual_type||"unknown"]||TC.unknown;const furl=`${API}/outputs/${frame.frame_path}`;return(
            <motion.div key={frame.id} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*0.03}}
              onClick={()=>setSelected(frame)} className="bg-bg-secondary dark:bg-dark-bg-secondary border border-border dark:border-dark-border rounded-2xl overflow-hidden cursor-pointer hover:border-accent/30 hover:scale-[1.01] transition-all group">
              <div className="relative aspect-video bg-bg-card dark:bg-dark-bg-card overflow-hidden">
                <img src={furl} alt={frame.caption||"Frame"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={e=>{(e.target as HTMLImageElement).style.opacity="0";}}/>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"/>
                <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/60 text-white text-xs font-mono px-2 py-0.5 rounded-md"><Clock className="w-2.5 h-2.5 opacity-70"/>{frame.timestamp_label}</div>
              </div>
              <div className="p-3">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md mb-2 inline-block" style={{background:cfg.bg,color:cfg.text,border:`1px solid ${cfg.border}`}}>{frame.visual_type||"Visual"}</span>
                {frame.caption&&<p className="text-xs text-text-secondary dark:text-dark-text-secondary leading-relaxed line-clamp-2 mb-1">{frame.caption}</p>}
                {frame.ocr_text&&<div className="bg-bg-card dark:bg-dark-bg-card rounded-lg px-2 py-1 border-l-2 border-border dark:border-dark-border"><p className="text-[10px] font-mono text-text-muted dark:text-dark-text-muted line-clamp-1">{frame.ocr_text}</p></div>}
              </div>
            </motion.div>);})}
        </div>
      )}
      <AnimatePresence>
        {selected&&(
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={()=>setSelected(null)}>
            <motion.div initial={{scale:0.92}} animate={{scale:1}} exit={{scale:0.92}} className="bg-bg-secondary dark:bg-dark-bg-secondary border border-border dark:border-dark-border rounded-2xl max-w-3xl w-full overflow-hidden" onClick={e=>e.stopPropagation()}>
              <div className="flex items-center justify-between px-5 py-3 border-b border-border dark:border-dark-border">
                <span className="text-xs font-mono text-accent">[{selected.timestamp_label}]</span>
                <div className="flex gap-2">
                  <a href={`${API}/outputs/${selected.frame_path}`} download className="flex items-center gap-1.5 text-xs text-text-muted dark:text-dark-text-muted hover:text-text-primary dark:hover:text-dark-text-primary bg-bg-hover dark:bg-dark-bg-hover px-3 py-1.5 rounded-lg" onClick={e=>e.stopPropagation()}><Download className="w-3.5 h-3.5"/>Download</a>
                  <button onClick={()=>setSelected(null)} className="p-1.5 rounded-lg hover:bg-bg-hover dark:hover:bg-dark-bg-hover text-text-muted dark:text-dark-text-muted hover:text-text-primary dark:hover:text-dark-text-primary"><X className="w-4 h-4"/></button>
                </div>
              </div>
              <img src={`${API}/outputs/${selected.frame_path}`} alt="" className="w-full max-h-[55vh] object-contain bg-bg-primary dark:bg-dark-bg-primary"/>
              <div className="p-5 space-y-3">
                {selected.caption&&<div><p className="text-[10px] text-text-muted dark:text-dark-text-muted uppercase tracking-wider mb-1">AI Caption</p><p className="text-sm text-text-secondary dark:text-dark-text-secondary">{selected.caption}</p></div>}
                {selected.ocr_text&&<div><p className="text-[10px] text-text-muted dark:text-dark-text-muted uppercase tracking-wider mb-1">OCR Text</p><div className="bg-bg-card dark:bg-dark-bg-card rounded-xl p-3 font-mono text-xs text-text-secondary dark:text-dark-text-secondary max-h-32 overflow-y-auto">{selected.ocr_text}</div></div>}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
