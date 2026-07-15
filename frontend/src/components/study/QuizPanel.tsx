"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Sparkles, Trophy, RefreshCw, CheckCircle2, XCircle, AlertCircle, ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const DIFFS=[{id:"easy",label:"Easy",color:"#10b981"},{id:"medium",label:"Medium",color:"#f59e0b"},{id:"hard",label:"Hard",color:"#ef4444"},{id:"advanced",label:"Advanced",color:"#8b5cf6"}];
const QTYPES=[{id:"mcq",label:"Multiple Choice"},{id:"true_false",label:"True / False"},{id:"fill_blank",label:"Fill in Blank"}];
interface Q { type:string; concept:string; question:string; options?:Record<string,string>; correct?:string; answer?:boolean|string; explanation:string; difficulty:string; }
export default function QuizPanel({projectId,existingQuiz}:{projectId:string;existingQuiz:{questions:Q[];total:number}|null}) {
  const [questions,setQuestions]=useState<Q[]>(existingQuiz?.questions||[]);
  const [generating,setGenerating]=useState(false); const [jobId,setJobId]=useState<string|null>(null);
  const [statusMsg,setStatusMsg]=useState(""); const [progress,setProgress]=useState(0);
  const [difficulty,setDifficulty]=useState("medium"); const [qtypes,setQtypes]=useState(["mcq","true_false","fill_blank"]);
  const [numQ,setNumQ]=useState(10); const [idx,setIdx]=useState(0);
  const [answers,setAnswers]=useState<Record<number,string>>({}); const [results,setResults]=useState(false); const [started,setStarted]=useState(false);
  useEffect(()=>{
    if(!jobId) return;
    const iv=setInterval(async()=>{
      try {
        const j=await fetch(`${API}/api/generate/status/${jobId}`).then(r=>r.json());
        setProgress(j.progress||0); setStatusMsg(j.message||"");
        if(j.status==="complete"&&j.result?.questions){setQuestions(j.result.questions);setGenerating(false);setJobId(null);setIdx(0);setAnswers({});setResults(false);setStarted(false);clearInterval(iv);}
        else if(j.status==="failed"){setStatusMsg(`Error: ${j.error}`);setGenerating(false);setJobId(null);clearInterval(iv);}
      } catch{clearInterval(iv);setGenerating(false);}
    },1500);
    return()=>clearInterval(iv);
  },[jobId]);
  const generate=async()=>{
    setGenerating(true); setProgress(0); setStatusMsg("Extracting concepts…");
    try{const{job_id}=await fetch(`${API}/api/generate/${projectId}/quiz`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({num_questions:numQ,difficulty,question_types:qtypes})}).then(r=>r.json());setJobId(job_id);}
    catch{setGenerating(false);}
  };
  const score=questions.filter((q,i)=>{const a=answers[i];if(!a)return false;if(q.type==="mcq"||q.type==="scenario")return a===q.correct;if(q.type==="true_false")return a===String(q.answer);return a.toLowerCase().trim()===(String(q.answer||"")).toLowerCase().trim();}).length;
  const cq=questions[idx];
  const answered=answers[idx]!==undefined;
  const isCorrect=answered&&(()=>{const a=answers[idx];if(cq.type==="mcq")return a===cq.correct;if(cq.type==="true_false")return a===String(cq.answer);return a.toLowerCase().trim()===(String(cq.answer||"")).toLowerCase().trim();})();
  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold accent-gradient">AI Quiz</h2>
          {questions.length>0&&!generating&&<p className="text-xs text-text-muted dark:text-dark-text-muted mt-0.5">{questions.length} questions · {difficulty} difficulty</p>}
        </div>
      </div>
      {(!questions.length||!started)&&(
        <div className="bg-bg-card dark:bg-dark-bg-card border border-border dark:border-dark-border shadow-card p-5 mb-5 rounded-2xl">
          <p className="text-sm font-medium text-text-primary dark:text-dark-text-primary mb-4">Quiz Settings</p>
          <div className="mb-4">
            <p className="text-xs text-text-disabled dark:text-dark-text-disabled uppercase tracking-wider mb-2">Difficulty</p>
            <div className="flex gap-2 flex-wrap">
              {DIFFS.map(d=><button key={d.id} onClick={()=>setDifficulty(d.id)}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-all border"
                style={difficulty===d.id?{borderColor:d.color+"60",background:d.color+"15",color:d.color}:{background:"transparent",color:"#64748b",borderColor:"rgba(15,23,42,0.1)"}}>
                {d.label}</button>)}
            </div>
          </div>
          <div className="mb-4">
            <p className="text-xs text-text-disabled dark:text-dark-text-disabled uppercase tracking-wider mb-2">Question Types</p>
            <div className="flex gap-2 flex-wrap">
              {QTYPES.map(qt=>{const a=qtypes.includes(qt.id);return(
                <button key={qt.id} onClick={()=>setQtypes(p=>a?p.filter(x=>x!==qt.id):[...p,qt.id])}
                  className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",a?"border-accent bg-accent/10 text-accent":"border-border dark:border-dark-border bg-bg-secondary dark:bg-dark-bg-secondary text-text-secondary dark:text-dark-text-secondary")}>
                  {a?"✓ ":""}{qt.label}</button>);})}
            </div>
          </div>
          <div className="mb-5">
            <p className="text-xs text-text-disabled dark:text-dark-text-disabled uppercase tracking-wider mb-2">Questions: {numQ}</p>
            <input type="range" min={5} max={20} value={numQ} onChange={e=>setNumQ(Number(e.target.value))} className="w-full accent-accent"/>
          </div>
          <button onClick={generate} disabled={generating||!qtypes.length}
            className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white font-semibold py-3 rounded-lg disabled:opacity-50 transition-all">
            {generating?<><Loader2 className="w-4 h-4 animate-spin"/>Generating… {progress}%</>:<><Sparkles className="w-4 h-4"/>{questions.length?"Regenerate Quiz":"Generate Quiz"}</>}
          </button>
          {generating&&<div className="mt-3"><div className="h-1.5 bg-bg-hover dark:bg-dark-bg-hover rounded-full overflow-hidden"><motion.div className="h-full bg-accent rounded-full" animate={{width:`${progress}%`}} transition={{duration:0.5}}/></div><p className="text-xs text-text-muted dark:text-dark-text-muted mt-1.5">{statusMsg}</p></div>}
          {questions.length>0&&!generating&&(
            <button onClick={()=>setStarted(true)} className="w-full mt-3 flex items-center justify-center gap-2 bg-success hover:bg-success/90 text-white font-medium py-2.5 rounded-lg transition-all">
              Start Quiz → {questions.length} questions
            </button>
          )}
        </div>
      )}
      {questions.length>0&&started&&!results&&cq&&(
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-text-muted dark:text-dark-text-muted">{idx+1}/{questions.length}</span>
            <span className="text-xs text-text-secondary dark:text-dark-text-secondary bg-bg-secondary dark:bg-dark-bg-secondary px-2.5 py-1 rounded-full capitalize">{cq.type.replace("_"," ")} · {cq.difficulty}</span>
            <span className="text-xs text-success">{score} correct</span>
          </div>
          <div className="h-1 bg-bg-secondary dark:bg-dark-bg-secondary rounded-full mb-5 overflow-hidden"><div className="h-full bg-accent rounded-full" style={{width:`${(idx/questions.length)*100}%`}}/></div>
          <div className="inline-flex items-center gap-1.5 text-xs text-accent bg-accent/10 border border-accent/20 px-3 py-1 rounded-full mb-4"><span>Concept:</span><span className="font-semibold">{cq.concept}</span></div>
          <div className="bg-bg-card dark:bg-dark-bg-card border border-border dark:border-dark-border shadow-card rounded-2xl p-6 mb-4">
            <p className="text-base font-medium text-text-primary dark:text-dark-text-primary mb-5">{cq.question}</p>
            {(cq.type==="mcq")&&cq.options&&(
              <div className="space-y-2.5">
                {Object.entries(cq.options).map(([letter,text])=>{const sel=answers[idx]===letter;const right=answered&&letter===cq.correct;const wrong=answered&&sel&&!right;return(
                  <button key={letter} onClick={()=>!answered&&setAnswers(p=>({...p,[idx]:letter}))} disabled={answered}
                    className={cn("w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl border text-sm transition-all",
                      !answered&&"hover:border-accent/30 hover:bg-accent/5 border-border dark:border-dark-border text-text-secondary dark:text-dark-text-secondary",
                      right&&"border-success/30 bg-success/10 text-success",
                      wrong&&"border-error/30 bg-error/10 text-error",
                      answered&&!right&&!sel&&"border-border dark:border-dark-border text-text-disabled dark:text-dark-text-disabled")}>
                    <span className={cn("w-6 h-6 rounded-full border text-xs font-bold flex items-center justify-center flex-shrink-0",right?"border-success text-success":wrong?"border-error text-error":"border-border dark:border-dark-border text-text-muted dark:text-dark-text-muted")}>{letter}</span>
                    {text}{right&&<CheckCircle2 className="w-4 h-4 text-success ml-auto"/>}{wrong&&<XCircle className="w-4 h-4 text-error ml-auto"/>}
                  </button>);})}
              </div>
            )}
            {cq.type==="true_false"&&(
              <div className="flex gap-3">
                {["true","false"].map(v=>{const sel=answers[idx]===v;const right=answered&&v===String(cq.answer);const wrong=answered&&sel&&!right;return(
                  <button key={v} onClick={()=>!answered&&setAnswers(p=>({...p,[idx]:v}))} disabled={answered}
                    className={cn("flex-1 py-3 rounded-xl font-semibold capitalize text-sm border transition-all",
                      !answered&&"border-border dark:border-dark-border text-text-secondary dark:text-dark-text-secondary hover:border-accent/30",
                      right&&"border-success/30 bg-success/10 text-success",
                      wrong&&"border-error/30 bg-error/10 text-error",
                      answered&&!sel&&"border-border dark:border-dark-border text-text-disabled dark:text-dark-text-disabled")}>
                    {v==="true"?"✓ True":"✗ False"}
                  </button>);})}
              </div>
            )}
            {cq.type==="fill_blank"&&(
              <div className="space-y-3">
                <input type="text" placeholder="Type your answer…" disabled={answered}
                  onKeyDown={e=>e.key==="Enter"&&!answered&&setAnswers(p=>({...p,[idx]:(e.target as HTMLInputElement).value}))}
                  id={`fill_${idx}`} className="w-full bg-bg-secondary dark:bg-dark-bg-secondary border border-border dark:border-dark-border focus:border-accent/50 rounded-xl px-4 py-3 text-sm text-text-primary dark:text-dark-text-primary outline-none"/>
                {!answered&&<button onClick={()=>{const v=(document.getElementById(`fill_${idx}`) as HTMLInputElement)?.value;if(v)setAnswers(p=>({...p,[idx]:v}));}} className="px-5 py-2 bg-accent hover:bg-accent-hover text-white text-sm rounded-xl font-medium transition-all">Submit</button>}
                {answered&&<p className={cn("text-sm font-medium",isCorrect?"text-success":"text-error")}>{isCorrect?"✓ Correct!":(`✗ Answer: "${cq.answer}"`)}</p>}
              </div>
            )}
            <AnimatePresence>
              {answered&&<motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className={cn("mt-4 rounded-xl p-4 border text-sm",isCorrect?"bg-success/8 border-success/20 text-success":"bg-warning/8 border-warning/20 text-warning")}>
                <div className="flex items-center gap-2 font-semibold mb-1"><AlertCircle className="w-4 h-4"/>{isCorrect?"Correct!":"Explanation:"}</div>
                <p className="text-text-secondary dark:text-dark-text-secondary text-xs">{cq.explanation}</p>
              </motion.div>}
            </AnimatePresence>
          </div>
          <div className="flex items-center justify-between">
            <button onClick={()=>setIdx(i=>Math.max(0,i-1))} disabled={idx===0} className="flex items-center gap-1.5 text-sm text-text-muted dark:text-dark-text-muted hover:text-text-primary dark:hover:text-dark-text-primary disabled:opacity-30 transition-colors"><ChevronLeft className="w-4 h-4"/>Previous</button>
            {idx<questions.length-1?<button onClick={()=>setIdx(i=>i+1)} className="flex items-center gap-1.5 text-sm bg-accent hover:bg-accent-hover text-white px-5 py-2 rounded-xl transition-all">Next<ChevronRight className="w-4 h-4"/></button>
            :<button onClick={()=>setResults(true)} className="flex items-center gap-1.5 text-sm bg-success hover:bg-success/90 text-white px-5 py-2 rounded-xl transition-all"><Trophy className="w-4 h-4"/>Results</button>}
          </div>
        </div>
      )}
      {results&&(
        <motion.div initial={{opacity:0,scale:0.96}} animate={{opacity:1,scale:1}} className="bg-bg-card dark:bg-dark-bg-card border border-border dark:border-dark-border shadow-card rounded-2xl p-8 text-center">
          <Trophy className="w-12 h-12 text-warning mx-auto mb-4"/>
          <h3 className="text-2xl font-bold text-text-primary dark:text-dark-text-primary mb-2">Quiz Complete!</h3>
          <div className="text-5xl font-bold mb-1" style={{color:score/questions.length>=0.7?"#16a34a":score/questions.length>=0.5?"#f59e0b":"#dc2626"}}>{score}/{questions.length}</div>
          <p className="text-text-muted dark:text-dark-text-muted mb-6">{Math.round(score/questions.length*100)}% · {score>=questions.length*0.8?"Excellent! 🎉":score>=questions.length*0.6?"Good job! 👍":"Keep practicing! 💪"}</p>
          <div className="flex gap-3 justify-center">
            <button onClick={()=>{setIdx(0);setAnswers({});setResults(false);setStarted(true);}} className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all"><RefreshCw className="w-4 h-4"/>Retry</button>
            <button onClick={()=>{setStarted(false);setResults(false);}} className="flex items-center gap-2 bg-bg-secondary dark:bg-dark-bg-secondary hover:bg-bg-hover dark:hover:bg-dark-bg-hover text-text-secondary dark:text-dark-text-secondary px-5 py-2.5 rounded-xl text-sm transition-all">New Quiz</button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
