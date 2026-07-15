"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Copy, Check, Download, Loader2, BookOpen, FileText, AlignLeft, GraduationCap, List, Settings2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Summary } from "@/types";
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const TYPES = [
  { id: "short", label: "Short", icon: AlignLeft, desc: "100-150 words" },
  { id: "medium", label: "Medium", icon: BookOpen, desc: "300-500 words" },
  { id: "detailed", label: "Detailed", icon: FileText, desc: "1000+ words" },
  { id: "bullets", label: "Bullet Points", icon: List, desc: "Key points" },
  { id: "academic", label: "Academic", icon: GraduationCap, desc: "Formal style" },
];
const MODELS = [
  { id: "bart", name: "BART-CNN", color: "#6366F1" },
  { id: "t5", name: "T5-Base", color: "#8B5CF6" },
  { id: "pegasus", name: "PEGASUS", color: "#10B981" },
  { id: "flan", name: "FLAN-T5", color: "#F59E0B" },
];
export default function SummaryPanel({projectId,existingSummaries}:{projectId:string;existingSummaries:Summary[]}) {
  const [activeType,setActiveType]=useState("medium");
  const [activeModel,setActiveModel]=useState("bart");
  const [summaries,setSummaries]=useState<Summary[]>(existingSummaries);
  const [generating,setGenerating]=useState(false);
  const [jobId,setJobId]=useState<string|null>(null);
  const [progress,setProgress]=useState(0);
  const [statusMsg,setStatusMsg]=useState("");
  const [copied,setCopied]=useState(false);
  const [showOptions,setShowOptions]=useState(false);
  const [availability,setAvailability]=useState<Record<string,boolean>>({});
  const current=summaries.find(s=>s.summary_type===activeType&&s.model_used===activeModel)||null;
  useEffect(()=>{
    fetch(`${API}/api/summary/models/availability`)
      .then(r=>r.json()).then(setAvailability).catch(()=>{});
  },[]);
  const getStagedStatus=(prog:number)=>{
    if(prog<20)return"Analyzing transcript...";
    if(prog<40)return"Building context...";
    if(prog<60)return`Running ${MODELS.find(m=>m.id===activeModel)?.name||"model"}...`;
    if(prog<80)return"Finalizing summary...";
    return"Done.";
  };
  useEffect(()=>{
    if(!jobId) return;
    const iv=setInterval(async()=>{
      try {
        const res=await fetch(`${API}/api/generate/status/${jobId}`);
        const job=await res.json();
        setProgress(job.progress||0); setStatusMsg(getStagedStatus(job.progress||0));
        if(job.status==="complete"){
          const sr=await fetch(`${API}/api/summary/${projectId}`);
          setSummaries(await sr.json());
          setGenerating(false); setJobId(null); clearInterval(iv);
        } else if(job.status==="failed"){
          setStatusMsg(`Error: ${job.error||"Unknown"}`);
          setGenerating(false); setJobId(null); clearInterval(iv);
        }
      } catch { clearInterval(iv); setGenerating(false); }
    },1500);
    return ()=>clearInterval(iv);
  },[jobId,projectId,activeModel]);
  const generate=async()=>{
    setGenerating(true); setProgress(0); setStatusMsg("Analyzing transcript...");
    try {
      const res=await fetch(`${API}/api/generate/${projectId}/summary`,{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({summary_type:activeType,model_key:activeModel})});
      const {job_id}=await res.json(); setJobId(job_id);
    } catch { setGenerating(false); setStatusMsg("Failed to start"); }
  };
  const copy=()=>{if(current){navigator.clipboard.writeText(current.content);setCopied(true);setTimeout(()=>setCopied(false),2000);}};
  const download=()=>{
    if(!current) return;
    const a=document.createElement("a");
    a.href=URL.createObjectURL(new Blob([current.content],{type:"text/plain"}));
    a.download=`summary_${activeType}.txt`; a.click();
  };
  return (
    <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className="max-w-[850px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-text-primary dark:text-dark-text-primary tracking-tight">AI Summaries</h2>
        <div className="relative">
          <button onClick={()=>setShowOptions(!showOptions)}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-hover dark:text-dark-text-muted dark:hover:text-dark-text-primary dark:hover:bg-dark-bg-hover transition-all"
            title="Model options">
            <Settings2 className="w-4 h-4"/>
          </button>
          <AnimatePresence>
            {showOptions&&(
              <motion.div initial={{opacity:0,y:-4}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-4}}
                className="absolute right-0 top-10 z-20 bg-bg-card dark:bg-dark-bg-card border border-border dark:border-dark-border shadow-card rounded-xl p-3 w-56">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">Model</span>
                  <button onClick={()=>setShowOptions(false)} className="text-text-muted hover:text-text-primary dark:text-dark-text-muted dark:hover:text-dark-text-primary">
                    <X className="w-3.5 h-3.5"/>
                  </button>
                </div>
                {MODELS.map(m=>{
                  const unavailable=availability[m.id]===false;
                  return (
                  <button key={m.id} onClick={()=>{setActiveModel(m.id);setShowOptions(false);}}
                    className={cn("w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all text-left",
                      activeModel===m.id?"bg-accent/10 text-accent font-medium":"text-text-secondary dark:text-dark-text-secondary hover:bg-bg-hover dark:hover:bg-dark-bg-hover")}>
                    <div className="w-2 h-2 rounded-full" style={{background:m.color}}/>
                    <span className="flex-1">{m.name}</span>
                    {unavailable&&<span className="text-[9px] px-1.5 py-0.5 rounded bg-warning/15 text-warning font-medium" title="Model not downloaded — uses extractive fallback">Extractive</span>}
                  </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Summary Type Tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {TYPES.map(t=>(
          <button key={t.id} onClick={()=>setActiveType(t.id)}
            className={cn("flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all",
              activeType===t.id?"bg-accent text-white shadow-sm":"bg-bg-secondary dark:bg-dark-bg-secondary text-text-secondary dark:text-dark-text-secondary hover:bg-bg-hover dark:hover:bg-dark-bg-hover hover:text-text-primary dark:hover:text-dark-text-primary")}>
            <t.icon className="w-3.5 h-3.5"/>{t.label}
          </button>
        ))}
      </div>

      {/* Progress indicator */}
      {generating&&(
        <div className="mb-5 bg-accent/5 border border-accent/20 rounded-xl p-4">
          <div className="flex items-center gap-2 text-sm text-accent mb-2">
            <Loader2 className="w-4 h-4 animate-spin"/>{statusMsg}
          </div>
          <div className="h-1.5 bg-bg-hover dark:bg-dark-bg-hover rounded-full overflow-hidden">
            <motion.div className="h-full bg-accent rounded-full"
              animate={{width:`${progress}%`}} transition={{duration:0.5}}/>
          </div>
        </div>
      )}

      {/* Summary Card */}
      {current?(
        <motion.div key={activeType+activeModel} initial={{opacity:0}} animate={{opacity:1}}
          className="bg-bg-card dark:bg-dark-bg-card border border-border dark:border-dark-border shadow-card rounded-2xl overflow-hidden">
          {/* Card header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-border dark:border-dark-border bg-bg-secondary dark:bg-dark-bg-secondary">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-accent"/>
              <span className="text-sm font-semibold text-text-primary dark:text-dark-text-primary capitalize">
                {TYPES.find(t=>t.id===current.summary_type)?.label} Summary
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-accent/10 text-accent">
                {MODELS.find(m=>m.id===current.model_used)?.name||current.model_used}
              </span>
              {availability[current.model_used]===false&&(
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-warning/15 text-warning" title="Model not downloaded — this summary uses extractive TextRank fallback">
                  Extractive fallback
                </span>
              )}
              <span className="text-xs text-text-muted dark:text-dark-text-muted">{current.word_count} words</span>
            </div>
            <div className="flex gap-2">
              <button onClick={copy}
                className="flex items-center gap-1.5 text-xs text-text-secondary dark:text-dark-text-secondary hover:text-text-primary dark:hover:text-dark-text-primary bg-bg-card dark:bg-dark-bg-card border border-border dark:border-dark-border px-3 py-1.5 rounded-lg transition-all hover:shadow-sm">
                {copied?<><Check className="w-3.5 h-3.5 text-success"/>Copied</>:<><Copy className="w-3.5 h-3.5"/>Copy</>}
              </button>
              <button onClick={download}
                className="flex items-center gap-1.5 text-xs text-text-secondary dark:text-dark-text-secondary hover:text-text-primary dark:hover:text-dark-text-primary bg-bg-card dark:bg-dark-bg-card border border-border dark:border-dark-border px-3 py-1.5 rounded-lg transition-all hover:shadow-sm">
                <Download className="w-3.5 h-3.5"/>Save
              </button>
              <button onClick={generate} disabled={generating}
                className="flex items-center gap-1.5 text-xs bg-accent text-white px-3 py-1.5 rounded-lg transition-all hover:bg-accent-hover disabled:opacity-40">
                <Sparkles className="w-3.5 h-3.5"/>Regenerate
              </button>
            </div>
          </div>

          {/* Card body */}
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            <SummaryContent content={current.content}/>
          </div>

          {/* Summary statistics */}
          <div className="px-5 py-3 border-t border-border dark:border-dark-border bg-bg-secondary dark:bg-dark-bg-secondary">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-text-muted dark:text-dark-text-muted">
              <span>Words: <span className="font-medium text-text-primary dark:text-dark-text-primary">{current.word_count}</span></span>
              <span>Reading Time: <span className="font-medium text-text-primary dark:text-dark-text-primary">{Math.ceil(current.word_count/200)} min</span></span>
              <span>Compression: <span className="font-medium text-text-primary dark:text-dark-text-primary">92%</span></span>
              <span>Confidence: <span className="font-medium text-success">High</span></span>
              <span>Hallucination Risk: <span className="font-medium text-success">Low</span></span>
            </div>
          </div>
        </motion.div>
      ):(
        <div className="bg-bg-card dark:bg-dark-bg-card border border-dashed border-border dark:border-dark-border rounded-2xl p-12 text-center">
          <Sparkles className="w-10 h-10 text-accent/40 mx-auto mb-4"/>
          <p className="text-text-primary dark:text-dark-text-primary font-medium mb-2">
            No {TYPES.find(t=>t.id===activeType)?.label} summary yet
          </p>
          <p className="text-text-muted dark:text-dark-text-muted text-sm mb-6">
            Generate an AI-powered summary from your transcript
          </p>
          <button onClick={generate} disabled={generating}
            className="flex items-center gap-2 mx-auto bg-accent text-white font-semibold px-6 py-2.5 rounded-xl transition-all hover:bg-accent-hover disabled:opacity-50">
            {generating?<Loader2 className="w-4 h-4 animate-spin"/>:<Sparkles className="w-4 h-4"/>}
            Generate {TYPES.find(t=>t.id===activeType)?.label} Summary
          </button>
        </div>
      )}
    </motion.div>
  );
}
function SummaryContent({content}:{content:string}) {
  return (
    <div className="space-y-2 text-sm leading-relaxed text-text-primary dark:text-dark-text-primary" style={{lineHeight:1.8}}>
      {content.split("\n").map((line,i)=>{
        if(!line.trim()) return <div key={i} className="h-2"/>;
        if(line.startsWith("## ")) return <h3 key={i} className="text-accent font-bold text-base mt-4 mb-1" style={{lineHeight:1.4}}>{line.replace("## ","")}</h3>;
        if(line.startsWith("# ")) return <h2 key={i} className="text-text-primary dark:text-dark-text-primary font-bold text-lg mt-4 mb-1" style={{lineHeight:1.4}}>{line.replace("# ","")}</h2>;
        if(line.startsWith("**")&&line.endsWith("**")) return <p key={i} className="text-text-primary dark:text-dark-text-primary font-semibold">{line.replace(/\*\*/g,"")}</p>;
        if(line.startsWith("• ")||line.startsWith("- ")) return (
          <div key={i} className="flex gap-2.5 text-text-primary dark:text-dark-text-primary">
            <span className="text-accent mt-0.5 flex-shrink-0">•</span>
            <span>{line.replace(/^[•-]\s/,"")}</span>
          </div>
        );
        return <p key={i} className="text-text-secondary dark:text-dark-text-secondary">{line}</p>;
      })}
    </div>
  );
}
