"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Youtube, FileVideo, Brain, MessageSquare, Search, Download, Mic, BookOpen, Zap, ChevronRight, Sun, Moon, Sparkles, GraduationCap, Presentation, FileText, BarChart3, Clock, Globe, Cpu } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

const FEATURES = [
  { icon: Brain,        title: "AI Summarization",          desc: "Multiple summary styles — short, detailed, bullet points, academic — powered by BART & T5" },
  { icon: Mic,          title: "Whisper Transcription",      desc: "Word-level timestamps, speaker detection, 90+ language support" },
  { icon: MessageSquare,title: "Chat with Video",           desc: "RAG-powered Q&A grounded in your video content with timestamp citations" },
  { icon: Search,       title: "Semantic Search",           desc: "FAISS vector search across transcript, captions, and OCR text" },
  { icon: BookOpen,     title: "Study Tools",               desc: "Auto-generated flashcards, quizzes, mind maps, and revision notes" },
  { icon: Presentation, title: "Slide Generator",           desc: "Create PPTX presentations from video content with customizable themes" },
  { icon: Download,     title: "Export Everything",         desc: "PDF, DOCX, SRT, VTT, JSON, CSV — or bundle all as a ZIP" },
  { icon: FileVideo,    title: "Frame Captioning",          desc: "BLIP-2 visual descriptions + Tesseract OCR from slides and diagrams" },
];

const PIPELINE = [
  { step: "01", label: "Input",       desc: "YouTube URL or local video",  icon: Youtube },
  { step: "02", label: "Audio",       desc: "FFmpeg extraction + normalize", icon: Mic },
  { step: "03", label: "Transcribe",  desc: "Whisper STT + timestamps",     icon: FileText },
  { step: "04", label: "Vision",      desc: "BLIP-2 captions + OCR",        icon: FileVideo },
  { step: "05", label: "NLP",         desc: "Chunking + keyphrase extract",  icon: Brain },
  { step: "06", label: "Summarize",   desc: "BART / T5 / PEGASUS",          icon: Sparkles },
  { step: "07", label: "Index",       desc: "FAISS vector embeddings",      icon: Search },
  { step: "08", label: "Output",      desc: "Chat, export, study tools",    icon: Download },
];

const USE_CASES = [
  { icon: GraduationCap, title: "Students",          desc: "Turn lecture recordings into flashcards, quizzes, and structured notes for exam prep." },
  { icon: FileText,      title: "Researchers",       desc: "Extract key insights from conference talks and seminars with timestamped citations." },
  { icon: Presentation,  title: "Professionals",     desc: "Summarize training videos and meetings into actionable slides and reports." },
  { icon: BarChart3,     title: "Content Creators",  desc: "Repurpose long-form video into summaries, blog posts, and social media content." },
];

const STATS = [
  { value: "8",    label: "AI Models" },
  { value: "90+",  label: "Languages" },
  { value: "6",    label: "Export Formats" },
  { value: "100%", label: "Open Source" },
];

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme();
  return (
    <div className="min-h-screen bg-bg-primary dark:bg-dark-bg-primary text-text-primary dark:text-dark-text-primary overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border dark:border-dark-border">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center text-sm">🎬</div>
            <span className="font-semibold tracking-tight">VideoLM</span>
            <span className="text-[9px] bg-accent/20 text-accent border border-accent/30 px-1.5 py-0.5 rounded-full font-semibold">BETA</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-text-muted dark:text-dark-text-muted">
            <a href="#features" className="hover:text-text-primary dark:hover:text-dark-text-primary transition-colors">Features</a>
            <a href="#usecases" className="hover:text-text-primary dark:hover:text-dark-text-primary transition-colors">Use Cases</a>
            <a href="#pipeline" className="hover:text-text-primary dark:hover:text-dark-text-primary transition-colors">Pipeline</a>
            <a href="#models" className="hover:text-text-primary dark:hover:text-dark-text-primary transition-colors">Models</a>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="flex items-center justify-center w-8 h-8 rounded-lg bg-bg-secondary hover:bg-bg-hover text-text-muted hover:text-text-primary transition-all">
              {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
            <Link href="/dashboard" className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white text-sm font-medium px-4 py-2 rounded-xl transition-all">
              Open App <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 text-center relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-accent/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 left-1/2 -translate-x-1/3 w-[400px] h-[300px] bg-accent/5 rounded-full blur-3xl pointer-events-none" />

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="relative max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 text-xs text-accent bg-accent/10 border border-accent/20 px-4 py-1.5 rounded-full mb-8 font-medium">
            <span className="w-1.5 h-1.5 bg-accent rounded-full pulse-dot" />
            Final Year Project — Free & Open-Source Models Only
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-none">
            <span className="gradient-text">Understand Any Video</span>
            <br />
            <span className="text-text-primary dark:text-dark-text-primary">With AI Intelligence</span>
          </h1>

          <p className="text-lg md:text-xl text-text-muted dark:text-dark-text-muted max-w-2xl mx-auto mb-10 leading-relaxed">
            Paste a YouTube URL. Get transcripts, summaries, frame captions, semantic search,
            flashcards, presentations, and an AI-powered chat — all powered by free open-source AI.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/dashboard" className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white font-semibold px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-accent/20 hover:scale-105">
              <Youtube className="w-5 h-5" />
              Analyze a Video
            </Link>
            <a href="#pipeline" className="flex items-center gap-2 glass text-text-secondary dark:text-dark-text-secondary font-medium px-6 py-3.5 rounded-xl transition-all hover:bg-bg-hover dark:hover:bg-dark-bg-hover">
              See how it works <ChevronRight className="w-4 h-4" />
            </a>
          </div>
        </motion.div>

        {/* Stats bar */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
          className="relative max-w-3xl mx-auto mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map(s => (
            <div key={s.label} className="glass rounded-2xl py-5 px-4 text-center">
              <div className="text-3xl font-bold gradient-text">{s.value}</div>
              <div className="text-xs text-text-muted dark:text-dark-text-muted mt-1 font-medium">{s.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Demo preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative mt-16 max-w-5xl mx-auto"
        >
          <div className="glass rounded-2xl p-1.5 shadow-2xl shadow-black/30">
            {/* Window chrome */}
            <div className="flex items-center gap-1.5 px-4 py-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-error/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-warning/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-success/60" />
              <div className="flex-1 text-center text-[10px] text-text-disabled dark:text-dark-text-disabled font-mono">videolm.app/results</div>
            </div>
            <div className="bg-bg-secondary dark:bg-dark-bg-secondary rounded-xl overflow-hidden h-96 relative">
              {/* Fake UI preview */}
              <div className="absolute inset-0 p-5 flex gap-3">
                {/* Sidebar */}
                <div className="w-48 bg-bg-card dark:bg-dark-bg-card rounded-xl p-3 flex flex-col gap-2 flex-shrink-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-5 h-5 rounded-md bg-accent/30" />
                    <div className="h-2 bg-accent/40 rounded w-16" />
                  </div>
                  <div className="h-px bg-border dark:bg-dark-border my-1" />
                  {["Summary","Transcript","Frames","Chat","Flashcards","Quiz","Mind Map","Audio","Slides","Export"].map((t, i) => (
                    <div key={t} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg ${i === 0 ? "bg-accent/10" : ""}`}>
                      <div className={`w-3 h-3 rounded ${i === 0 ? "bg-accent/50" : "bg-text-disabled/20"}`} />
                      <div className={`h-1.5 rounded w-20 ${i === 0 ? "bg-accent/40" : "bg-text-disabled/20"}`} />
                    </div>
                  ))}
                </div>
                {/* Main content */}
                <div className="flex-1 flex flex-col gap-3 min-w-0">
                  {/* Tabs */}
                  <div className="flex gap-1.5">
                    {["Summary","Transcript","Chat","Frames"].map((t, i) => (
                      <div key={t} className={`px-2.5 py-1 rounded-lg text-[10px] font-medium ${i === 0 ? "bg-accent text-white" : "bg-bg-hover dark:bg-dark-bg-hover text-text-muted dark:text-dark-text-muted"}`}>{t}</div>
                    ))}
                  </div>
                  {/* Content cards */}
                  <div className="flex-1 bg-bg-card dark:bg-dark-bg-card rounded-xl p-4 flex flex-col gap-3 overflow-hidden">
                    <div className="h-3 bg-accent/40 rounded w-1/3" />
                    <div className="h-2 bg-text-disabled/30 rounded w-full" />
                    <div className="h-2 bg-text-disabled/30 rounded w-5/6" />
                    <div className="h-2 bg-text-disabled/30 rounded w-4/5" />
                    <div className="h-px bg-border dark:bg-dark-border my-1" />
                    <div className="flex gap-2">
                      <div className="flex-1 bg-bg-secondary dark:bg-dark-bg-secondary rounded-lg p-3">
                        <div className="h-2 bg-accent/30 rounded w-2/3 mb-2" />
                        <div className="h-1.5 bg-text-disabled/20 rounded w-full mb-1" />
                        <div className="h-1.5 bg-text-disabled/20 rounded w-4/5" />
                      </div>
                      <div className="flex-1 bg-bg-secondary dark:bg-dark-bg-secondary rounded-lg p-3">
                        <div className="h-2 bg-success/30 rounded w-2/3 mb-2" />
                        <div className="h-1.5 bg-text-disabled/20 rounded w-full mb-1" />
                        <div className="h-1.5 bg-text-disabled/20 rounded w-3/4" />
                      </div>
                    </div>
                    <div className="mt-auto flex items-center gap-2">
                      <div className="flex-1 bg-bg-secondary dark:bg-dark-bg-secondary rounded-lg px-3 py-2">
                        <div className="h-2 bg-text-disabled/20 rounded w-32" />
                      </div>
                      <div className="w-7 h-7 rounded-lg bg-accent/80" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 border-t border-border dark:border-dark-border">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs text-accent font-semibold tracking-widest uppercase mb-3">Capabilities</p>
            <h2 className="text-4xl font-bold gradient-text mb-4">Everything in one platform</h2>
            <p className="text-text-muted dark:text-dark-text-muted max-w-xl mx-auto">A complete multimodal AI pipeline from URL to insights.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                className="glass rounded-2xl p-5 hover:border-accent/30 hover:-translate-y-1 transition-all duration-300 group">
                <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center mb-4 group-hover:bg-accent/25 transition-colors">
                  <f.icon className="w-5 h-5 text-accent" />
                </div>
                <h3 className="font-semibold text-text-primary dark:text-dark-text-primary text-sm mb-2">{f.title}</h3>
                <p className="text-xs text-text-muted dark:text-dark-text-muted leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section id="usecases" className="py-24 px-6 border-t border-border dark:border-dark-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs text-accent font-semibold tracking-widest uppercase mb-3">Who's it for</p>
            <h2 className="text-4xl font-bold gradient-text mb-4">Built for everyone</h2>
            <p className="text-text-muted dark:text-dark-text-muted max-w-xl mx-auto">From students to professionals — VideoLM adapts to your workflow.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {USE_CASES.map((u, i) => (
              <motion.div key={u.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="glass rounded-2xl p-6 text-center hover:border-accent/30 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-accent/15 flex items-center justify-center mx-auto mb-4">
                  <u.icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-semibold text-text-primary dark:text-dark-text-primary text-sm mb-2">{u.title}</h3>
                <p className="text-xs text-text-muted dark:text-dark-text-muted leading-relaxed">{u.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pipeline */}
      <section id="pipeline" className="py-24 px-6 border-t border-border dark:border-dark-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs text-accent font-semibold tracking-widest uppercase mb-3">Architecture</p>
            <h2 className="text-4xl font-bold gradient-text mb-4">8-Stage AI Pipeline</h2>
            <p className="text-text-muted dark:text-dark-text-muted max-w-xl mx-auto">From raw video to structured insights — fully automated.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            {PIPELINE.map((p, i) => (
              <motion.div key={p.step} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="glass rounded-xl p-4 text-center hover:border-accent/30 transition-all group">
                <div className="flex items-center justify-center mb-2">
                  <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center group-hover:bg-accent/25 transition-colors">
                    <p.icon className="w-4 h-4 text-accent" />
                  </div>
                </div>
                <div className="text-[10px] font-bold text-accent/50 font-mono mb-1">{p.step}</div>
                <div className="text-xs font-semibold text-text-primary dark:text-dark-text-primary mb-1">{p.label}</div>
                <div className="text-[10px] text-text-muted dark:text-dark-text-muted leading-snug">{p.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Models */}
      <section id="models" className="py-24 px-6 border-t border-border dark:border-dark-border">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs text-success font-semibold tracking-widest uppercase mb-3">Models</p>
          <h2 className="text-4xl font-bold gradient-text mb-4">100% Free & Open-Source</h2>
          <p className="text-text-muted dark:text-dark-text-muted mb-12 max-w-lg mx-auto">No API keys, no subscriptions. Runs entirely on your machine.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[["Whisper","Speech-to-Text","#3b82f6"],["BART-large","Summarization","#8b5cf6"],
              ["FLAN-T5","Question Answering","#06b6d4"],["BLIP-2","Frame Captioning","#10b981"],
              ["MiniLM","Embeddings","#f59e0b"],["FAISS","Vector Search","#ef4444"],
              ["Tesseract","OCR","#6366f1"],["KeyBERT","Keyphrases","#ec4899"]].map(([name, role, color]) => (
              <motion.div key={name} whileHover={{ y: -4 }} className="glass rounded-xl p-4 hover:border-accent/30 transition-all">
                <div className="w-8 h-8 rounded-lg mx-auto mb-3 flex items-center justify-center" style={{ background: color + "20" }}>
                  <Cpu className="w-4 h-4" style={{ color }} />
                </div>
                <div className="text-sm font-semibold text-text-primary dark:text-dark-text-primary mb-1">{name}</div>
                <div className="text-xs" style={{ color }}>{role}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 border-t border-border dark:border-dark-border text-center relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-accent/8 rounded-full blur-3xl pointer-events-none" />
        <div className="relative">
          <h2 className="text-4xl font-bold gradient-text mb-4">Start analyzing videos</h2>
          <p className="text-text-muted dark:text-dark-text-muted mb-8 max-w-lg mx-auto">Paste a YouTube URL and get full AI analysis in minutes.</p>
          <Link href="/dashboard" className="inline-flex items-center gap-2 bg-accent text-white font-semibold px-10 py-4 rounded-xl hover:scale-105 transition-all shadow-lg shadow-accent/20">
            Open VideoLM <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-border dark:border-dark-border py-8 text-center text-sm text-text-disabled dark:text-dark-text-disabled">
        VideoLM © {new Date().getFullYear()} — Final Year Project · Free Open-Source Models
      </footer>
    </div>
  );
}
