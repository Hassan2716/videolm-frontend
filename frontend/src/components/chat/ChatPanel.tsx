"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, Bot, User, Clock, Sparkles, Trash2, Copy, Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const STARTERS = ["What is the main topic?","Explain the key concepts","What are the takeaways?",
  "What algorithms are discussed?","Give me a summary","What examples are given?",
  "Compare the main approaches","What definitions are provided?"];
interface Citation { timestamp:string; text:string; source:string; score?:number; }
interface Msg { id:string; role:"user"|"assistant"; content:string; citations?:Citation[]; created_at:string; }
export default function ChatPanel({projectId}:{projectId:string}) {
  const [msgs,setMsgs] = useState<Msg[]>([]);
  const [input,setInput] = useState("");
  const [sending,setSending] = useState(false);
  const [loading,setLoading] = useState(true);
  const [copiedId,setCopiedId] = useState<string|null>(null);
  const [expandedCits,setExpandedCits] = useState<Set<string>>(new Set());
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);
  useEffect(()=>{
    fetch(`${API}/api/chat/${projectId}/history`).then(r=>r.json()).then(setMsgs).catch(()=>{}).finally(()=>setLoading(false));
  },[projectId]);
  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:"smooth"}); },[msgs,sending]);
  const send = async (text?:string) => {
    const msg=(text||input).trim(); if(!msg||sending) return;
    setInput(""); setSending(true);
    setMsgs(p=>[...p,{id:Date.now().toString(),role:"user",content:msg,created_at:new Date().toISOString()}]);
    try {
      const res=await fetch(`${API}/api/chat/`,{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({project_id:projectId,message:msg,include_citations:true})});
      const reply = await res.json();
      setMsgs(p=>[...p,reply]);
    } catch {
      setMsgs(p=>[...p,{id:Date.now().toString(),role:"assistant",
        content:"Connection error — check the backend is running.",created_at:new Date().toISOString()}]);
    } finally { setSending(false); inputRef.current?.focus(); }
  };
  const clear = async () =>{ if(!confirm("Clear chat?")) return;
    await fetch(`${API}/api/chat/${projectId}/history`,{method:"DELETE"}); setMsgs([]); };
  const toggleCit=(id:string)=>setExpandedCits(p=>{const n=new Set(p);n.has(id)?n.delete(id):n.add(id);return n;});
  const SRC_COLOR:Record<string,string>={transcript:"#3b82f6",frame_caption:"#8b5cf6",slide_text:"#10b981",ocr:"#f59e0b"};
  return (
    <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className="flex flex-col h-[calc(100vh-140px)] max-w-3xl">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div>
          <h2 className="text-xl font-bold text-text-primary dark:text-dark-text-primary">Chat with Video</h2>
          <p className="text-xs text-text-muted dark:text-dark-text-muted mt-0.5">Answers grounded in transcript · citations included</p>
        </div>
        {msgs.length>0&&<button onClick={clear} className="flex items-center gap-1.5 text-xs text-text-muted dark:text-dark-text-muted hover:text-error px-3 py-1.5 rounded-lg hover:bg-error/10 transition-all"><Trash2 className="w-3.5 h-3.5"/>Clear</button>}
      </div>
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1 min-h-0">
        {loading?(<div className="flex justify-center py-12"><Loader2 className="w-5 h-5 text-text-muted dark:text-dark-text-muted animate-spin"/></div>)
        :msgs.length===0?(
          <div className="py-4">
            <div className="bg-accent/5 border border-border dark:border-dark-border rounded-2xl p-6 mb-5 text-center">
              <div className="w-12 h-12 rounded-2xl bg-accent/15 flex items-center justify-center mx-auto mb-3"><Sparkles className="w-6 h-6 text-accent"/></div>
              <h3 className="font-semibold text-text-primary dark:text-dark-text-primary mb-1">Chat with this video</h3>
              <p className="text-xs text-text-muted dark:text-dark-text-muted">Answers come with timestamp citations from the transcript</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {STARTERS.map(q=><button key={q} onClick={()=>send(q)} className="text-left text-xs text-text-muted dark:text-dark-text-muted hover:text-text-primary dark:hover:text-dark-text-primary bg-bg-card dark:bg-dark-bg-card hover:bg-bg-hover dark:hover:bg-dark-bg-hover border border-border dark:border-dark-border px-4 py-3 rounded-xl transition-all">{q}</button>)}
            </div>
          </div>
        ):msgs.map(msg=>(
          <div key={msg.id} className={cn("flex gap-3",msg.role==="user"&&"flex-row-reverse")}>
            <div className={cn("w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5",msg.role==="user"?"bg-accent/20":"bg-accent/10")}>
              {msg.role==="user"?<User className="w-3.5 h-3.5 text-accent"/>:<Bot className="w-3.5 h-3.5 text-accent"/>}
            </div>
            <div className={cn("flex flex-col gap-2 max-w-[80%]",msg.role==="user"&&"items-end")}>
              <div className={cn("rounded-2xl px-4 py-3 text-sm leading-relaxed relative group",
                msg.role==="user"?"bg-accent text-white border border-accent rounded-br-sm":"bg-bg-elevated dark:bg-dark-bg-card text-text-primary dark:text-dark-text-primary border border-border dark:border-dark-border rounded-bl-sm")}>
                {msg.content.split("\n").map((l,i)=><span key={i}>{l}{i<msg.content.split("\n").length-1&&<br/>}</span>)}
                <button onClick={()=>{navigator.clipboard.writeText(msg.content);setCopiedId(msg.id);setTimeout(()=>setCopiedId(null),2000);}}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-bg-hover dark:hover:bg-dark-bg-hover">
                  {copiedId===msg.id?<Check className="w-3 h-3 text-success"/>:<Copy className="w-3 h-3 text-text-muted dark:text-dark-text-muted"/>}
                </button>
              </div>
              {msg.citations&&msg.citations.length>0&&(
                <div className="w-full">
                  <button onClick={()=>toggleCit(msg.id)} className="flex items-center gap-1.5 text-[10px] text-text-muted dark:text-dark-text-muted hover:text-text-secondary dark:text-dark-text-secondary">
                    <Clock className="w-3 h-3"/>{msg.citations.length} source{msg.citations.length>1?"s":""} cited
                    <ChevronDown className={cn("w-3 h-3 transition-transform",expandedCits.has(msg.id)&&"rotate-180")}/>
                  </button>
                  <AnimatePresence>
                    {expandedCits.has(msg.id)&&(
                      <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}} className="mt-2 space-y-1.5 overflow-hidden">
                        {msg.citations.map((c,i)=>(
                          <div key={i} className="flex gap-2 bg-bg-secondary dark:bg-dark-bg-secondary/60 border border-border dark:border-dark-border rounded-xl px-3 py-2">
                            <div className="w-1.5 flex-shrink-0 rounded-full mt-0.5" style={{background:SRC_COLOR[c.source]||"#64748b"}}/>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-[10px] font-mono font-semibold" style={{color:SRC_COLOR[c.source]||"#64748b"}}>[{c.timestamp}]</span>
                                <span className="text-[10px] text-text-disabled dark:text-dark-text-disabled capitalize">{c.source.replace("_"," ")}</span>
                              </div>
                              <p className="text-[11px] text-text-muted dark:text-dark-text-muted line-clamp-2">{c.text}</p>
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        ))}
        {sending&&(
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0"><Bot className="w-3.5 h-3.5 text-accent"/></div>
            <div className="bg-bg-elevated dark:bg-dark-bg-card border border-border dark:border-dark-border rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1">
              {[0,1,2].map(i=><div key={i} className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" style={{animationDelay:`${i*0.15}s`}}/>)}
            </div>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>
      <div className="flex-shrink-0 bg-bg-card dark:bg-dark-bg-card border border-border dark:border-dark-border rounded-2xl p-3 flex gap-3 items-end">
        <textarea ref={inputRef} value={input} onChange={e=>setInput(e.target.value)}
          onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}}
          placeholder="Ask a question about the video… (Enter to send)"
          rows={1} className="flex-1 bg-transparent text-sm text-text-primary dark:text-dark-text-primary placeholder:text-text-muted dark:placeholder:text-dark-text-muted outline-none resize-none max-h-32"
          onInput={e=>{const el=e.target as HTMLTextAreaElement;el.style.height="auto";el.style.height=Math.min(el.scrollHeight,128)+"px";}}/>
        <button onClick={()=>send()} disabled={!input.trim()||sending}
          className="w-9 h-9 rounded-xl bg-accent disabled:opacity-40 flex items-center justify-center transition-all flex-shrink-0">
          {sending?<Loader2 className="w-4 h-4 text-white animate-spin"/>:<Send className="w-4 h-4 text-white"/>}
        </button>
      </div>
    </motion.div>
  );
}
