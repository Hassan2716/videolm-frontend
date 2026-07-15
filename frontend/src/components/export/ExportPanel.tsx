"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, FileText, File, Code, Archive, CheckSquare, Square, Loader2, Check, ExternalLink, AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const FORMATS=[{id:"pdf",label:"PDF Report",icon:FileText,desc:"Cover page, all sections, professional layout",color:"#ef4444",ext:".pdf"},
  {id:"docx",label:"Word Document",icon:File,desc:"Editable DOCX with headings and timestamps",color:"#2563eb",ext:".docx"},
  {id:"txt",label:"Plain Text",icon:FileText,desc:"Clean timestamped transcript",color:"#64748b",ext:".txt"},
  {id:"srt",label:"SRT Subtitles",icon:FileText,desc:"Standard subtitle format",color:"#8b5cf6",ext:".srt"},
  {id:"json",label:"JSON Export",icon:Code,desc:"All data in structured JSON",color:"#10b981",ext:".json"},
  {id:"csv",label:"CSV Transcript",icon:FileText,desc:"Spreadsheet-ready transcript",color:"#f59e0b",ext:".csv"},
  {id:"zip",label:"Full Bundle",icon:Archive,desc:"PDF + DOCX + TXT + JSON + SRT in one ZIP",color:"#ec4899",ext:".zip",recommended:true}];
const SECTIONS=[
  {id:"short_summary",label:"Short Summary",group:"Summaries"},{id:"medium_summary",label:"Study Notes",group:"Summaries"},
  {id:"detailed_summary",label:"Detailed Notes",group:"Summaries"},{id:"bullet_summary",label:"Bullet Points",group:"Summaries"},
  {id:"transcript",label:"Full Transcript",group:"Content"},
  {id:"key_timestamps",label:"Key Timestamps",group:"Content"},{id:"flashcards",label:"Flashcards",group:"Study"},
  {id:"quiz",label:"Quiz Questions",group:"Study"},{id:"cover",label:"Cover Page",group:"Other"},
  {id:"metadata",label:"Video Metadata",group:"Other"}];
const GROUPS=["Summaries","Content","Study","Other"];
export default function ExportPanel({projectId}:{projectId:string}) {
  const [fmt,setFmt]=useState("pdf");
  const [secs,setSecs]=useState(["cover","metadata","medium_summary","transcript"]);
  const [status,setStatus]=useState<"idle"|"pending"|"processing"|"complete"|"failed">("idle");
  const [exportId,setExportId]=useState<string|null>(null);
  const [dlUrl,setDlUrl]=useState<string|null>(null);
  const [error,setError]=useState("");
  const [progress,setProgress]=useState(0);
  const [statusMsg,setStatusMsg]=useState("");
  const getStagedStatus=(prog:number)=>{
    if(prog<20)return"Generating Summary...";
    if(prog<40)return"Formatting content...";
    if(prog<60)return"Embedding images...";
    if(prog<80)return"Creating export file...";
    if(prog<100)return"Compressing files...";
    return"Done.";
  };
  useEffect(()=>{
    if(!exportId) return;
    const iv=setInterval(async()=>{
      try{const j=await fetch(`${API}/api/export/${exportId}/status`).then(r=>r.json());
        setProgress(j.progress||0); setStatusMsg(getStagedStatus(j.progress||0));
        if(j.status==="complete"){clearInterval(iv);setStatus("complete");setDlUrl(`${API}/api/export/${exportId}/download`);}
        else if(j.status==="failed"){clearInterval(iv);setStatus("failed");setError("Export failed. Try again or use a different format.");}
        else setStatus("processing");
      } catch{clearInterval(iv);setStatus("failed");}
    },1500);
    return()=>clearInterval(iv);
  },[exportId]);
  const toggle=(id:string)=>setSecs(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id]);
  const selectGroup=(g:string,all:boolean)=>{const gs=SECTIONS.filter(s=>s.group===g).map(s=>s.id);setSecs(p=>all?[...new Set([...p,...gs])]:p.filter(id=>!gs.includes(id)));};
  const start=async()=>{
    if(!secs.length){setError("Select at least one section");return;}
    setStatus("pending");setDlUrl(null);setError("");setProgress(0);
    try{const j=await fetch(`${API}/api/export/`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({project_id:projectId,format:fmt,content_types:secs})}).then(r=>r.json());setExportId(j.id);}
    catch{setStatus("failed");setError("Backend error — check server is running.");}
  };
  const reset=()=>{setStatus("idle");setExportId(null);setDlUrl(null);setError("");setProgress(0);};
  const cf=FORMATS.find(f=>f.id===fmt)!;
  return (
    <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div><h2 className="text-2xl font-bold text-text-primary dark:text-dark-text-primary tracking-tight">Export Center</h2><p className="text-xs text-text-muted dark:text-dark-text-muted mt-0.5">All selected sections are guaranteed to appear</p></div>
        <div className="flex gap-2">
          <button onClick={()=>setSecs(SECTIONS.map(s=>s.id))} className="text-xs text-text-secondary dark:text-dark-text-secondary hover:text-text-primary dark:hover:text-dark-text-primary bg-bg-secondary dark:bg-dark-bg-secondary hover:bg-bg-hover dark:hover:bg-dark-bg-hover px-3 py-1.5 rounded-lg transition-all">Select All</button>
          <button onClick={()=>setSecs([])} className="text-xs text-text-secondary dark:text-dark-text-secondary hover:text-text-primary dark:hover:text-dark-text-primary bg-bg-secondary dark:bg-dark-bg-secondary hover:bg-bg-hover dark:hover:bg-dark-bg-hover px-3 py-1.5 rounded-lg transition-all">Clear All</button>
        </div>
      </div>
      <div className="grid lg:grid-cols-[1fr_340px] gap-6">
        <div className="space-y-5">
          <div>
            <p className="text-xs text-text-muted dark:text-dark-text-muted uppercase tracking-wider font-semibold mb-3">Format</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {FORMATS.map(f=>(
                <button key={f.id} onClick={()=>{setFmt(f.id);reset();}}
                  className={cn("relative flex flex-col items-center gap-2 p-4 rounded-xl border transition-all text-center",
                    fmt===f.id?"border-accent bg-accent/5 shadow-sm":"border-border dark:border-dark-border bg-bg-card dark:bg-dark-bg-card text-text-muted dark:text-dark-text-muted hover:border-accent/40 hover:shadow-sm")}>
                  {f.recommended&&<span className="absolute -top-2 -right-2 text-[9px] bg-accent text-white px-1.5 py-0.5 rounded-full font-bold">BEST</span>}
                  <f.icon className={cn("w-5 h-5",fmt===f.id?"text-accent":"text-text-muted dark:text-dark-text-muted")}/>
                  <span className={cn("text-xs font-semibold",fmt===f.id?"text-accent":"text-text-secondary dark:text-dark-text-secondary")}>{f.label}</span>
                  <span className="text-[10px] text-text-muted dark:text-dark-text-muted">{f.ext}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-text-muted dark:text-dark-text-muted uppercase tracking-wider font-semibold mb-3">Sections ({secs.length} selected)</p>
            {GROUPS.map(g=>{const gs=SECTIONS.filter(s=>s.group===g);const all=gs.every(s=>secs.includes(s.id));return(
              <div key={g} className="mb-4">
                <div className="flex items-center justify-between mb-2"><p className="text-xs font-semibold text-text-secondary dark:text-dark-text-secondary">{g}</p><button onClick={()=>selectGroup(g,!all)} className="text-[10px] text-text-muted dark:text-dark-text-muted hover:text-accent transition-colors">{all?"Deselect all":"Select all"}</button></div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {gs.map(s=>{const active=secs.includes(s.id);return(
                    <button key={s.id} onClick={()=>toggle(s.id)} className={cn("flex items-center gap-2 px-3 py-2 rounded-xl border text-xs transition-all text-left",active?"bg-accent/10 border-accent/30 text-accent":"border-border dark:border-dark-border bg-bg-card dark:bg-dark-bg-card text-text-muted dark:text-dark-text-muted hover:border-accent/30 hover:text-text-secondary dark:hover:text-dark-text-secondary")}>
                      {active?<CheckSquare className="w-3.5 h-3.5 text-accent flex-shrink-0"/>:<Square className="w-3.5 h-3.5 text-text-muted dark:text-dark-text-muted flex-shrink-0"/>}{s.label}
                    </button>);})}
                </div>
              </div>);
            })}
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <div className="bg-bg-card dark:bg-dark-bg-card border border-border dark:border-dark-border shadow-card rounded-2xl p-5">
            <p className="text-sm font-semibold text-text-primary dark:text-dark-text-primary mb-3">Summary</p>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-text-muted dark:text-dark-text-muted"><span>Format</span><span className="text-text-primary dark:text-dark-text-primary font-medium">{cf.label}</span></div>
              <div className="flex justify-between text-text-muted dark:text-dark-text-muted"><span>Sections</span><span className="text-text-primary dark:text-dark-text-primary font-medium">{secs.length}</span></div>
              <div className="border-t border-border dark:border-dark-border pt-2 flex flex-wrap gap-1">
                {secs.slice(0,6).map(id=><span key={id} className="bg-bg-secondary dark:bg-dark-bg-secondary text-text-secondary dark:text-dark-text-secondary px-2 py-0.5 rounded-md text-[10px]">{SECTIONS.find(s=>s.id===id)?.label}</span>)}
                {secs.length>6&&<span className="text-text-muted dark:text-dark-text-muted text-[10px] px-2">+{secs.length-6} more</span>}
              </div>
            </div>
          </div>
          <button onClick={start} disabled={status==="pending"||status==="processing"||!secs.length}
            className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white font-semibold py-3.5 rounded-xl transition-all disabled:opacity-50 shadow-sm">
            {status==="pending"||status==="processing"?<><Loader2 className="w-4 h-4 animate-spin"/>Generating…</>:<><Download className="w-4 h-4"/>Generate Export</>}
          </button>
          {(status==="pending"||status==="processing")&&(
            <div>
              <div className="h-1.5 bg-bg-hover dark:bg-dark-bg-hover rounded-full overflow-hidden"><motion.div className="h-full bg-accent rounded-full" animate={{width:`${progress||30}%`}} transition={{duration:0.5}}/></div>
              <p className="text-xs text-text-muted dark:text-dark-text-muted mt-2 text-center">{statusMsg}</p>
            </div>
          )}
          <AnimatePresence>
            {status==="complete"&&dlUrl&&(
              <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className="space-y-3">
                <div className="flex flex-col items-center gap-3 bg-success/5 border border-success/20 rounded-xl py-6">
                  <motion.div initial={{scale:0}} animate={{scale:1}} transition={{type:"spring",stiffness:200,damping:15}}
                    className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                    <Check className="w-6 h-6 text-success"/>
                  </motion.div>
                  <p className="text-sm font-semibold text-text-primary dark:text-dark-text-primary">Export Completed Successfully</p>
                </div>
                <a href={dlUrl} download className="flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white py-3 rounded-xl font-medium text-sm transition-all">
                  <Download className="w-4 h-4"/>Download {cf.label}<ExternalLink className="w-3.5 h-3.5 opacity-60"/>
                </a>
                <button onClick={reset} className="w-full text-xs text-text-secondary dark:text-dark-text-secondary hover:text-text-primary dark:hover:text-dark-text-primary py-2 flex items-center justify-center gap-1 transition-colors"><RefreshCw className="w-3 h-3"/>Generate Another</button>
              </motion.div>
            )}
          </AnimatePresence>
          {status==="failed"&&<div className="flex gap-2 text-sm text-error bg-error/10 border border-error/20 rounded-xl px-4 py-3"><AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5"/><div><p className="font-medium">Failed</p><p className="text-xs text-error/70 mt-0.5">{error}</p><button onClick={reset} className="text-xs text-error mt-2">Try again →</button></div></div>}
        </div>
      </div>
    </motion.div>
  );
}
