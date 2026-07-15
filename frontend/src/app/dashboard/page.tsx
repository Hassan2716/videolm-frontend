"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Youtube, FileVideo, Trash2, Clock, CheckCircle2, AlertCircle, Loader2, ArrowRight, Play, Search, Sun, Moon, LayoutGrid, Film, Sparkles } from "lucide-react";
import { listProjects, deleteProject, submitYouTube, uploadVideo, getYouTubeInfo } from "@/lib/api";
import { cn, isValidYouTube, formatDuration, formatRelative, STATUS_COLORS } from "@/lib/utils";
import type { Project } from "@/types";
import { useDropzone } from "react-dropzone";
import Link from "next/link";
import { useTheme } from "@/contexts/ThemeContext";

function StatusIcon({ s }: { s: string }) {
  if (s === "complete")   return <CheckCircle2 className="w-4 h-4 text-success" />;
  if (s === "failed")     return <AlertCircle   className="w-4 h-4 text-error" />;
  if (s === "processing") return <Loader2       className="w-4 h-4 text-accent animate-spin" />;
  return <Clock className="w-4 h-4 text-text-muted dark:text-dark-text-muted" />;
}

export default function DashboardPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [ytUrl, setYtUrl] = useState("");
  const [ytInfo, setYtInfo] = useState<Record<string, unknown> | null>(null);
  const [ytLoading, setYtLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [tab, setTab] = useState<"youtube"|"upload">("youtube");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const load = async () => {
    try {
      const data = await listProjects();
      setProjects(data);
    } catch { /* api not running */ }
    finally { setLoading(false); }
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 3000);
    return () => clearInterval(t);
  }, []);

  const ytDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleYtChange = (url: string) => {
    setYtUrl(url); setYtInfo(null);
    if (ytDebounce.current) clearTimeout(ytDebounce.current);
    if (!isValidYouTube(url)) { setYtLoading(false); return; }
    setYtLoading(true);
    // Debounce the metadata preview so we don't spawn a yt-dlp call per keystroke.
    ytDebounce.current = setTimeout(async () => {
      try { const i = await getYouTubeInfo(url); setYtInfo(i); } catch { /* preview is optional */ }
      finally { setYtLoading(false); }
    }, 600);
  };

  const handleYtSubmit = async () => {
    if (!isValidYouTube(ytUrl)) return setError("Invalid YouTube URL");
    setSubmitting(true); setError("");
    try {
      const p = await submitYouTube(ytUrl);
      router.push(`/process/${p.id}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Submission failed");
    } finally { setSubmitting(false); }
  };

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    accept: { "video/*": [".mp4",".avi",".mov",".webm",".mkv"] },
    maxFiles: 1,
  });

  const handleFileSubmit = async () => {
    if (!acceptedFiles[0]) return;
    setSubmitting(true); setError("");
    try {
      const p = await uploadVideo(acceptedFiles[0]);
      router.push(`/process/${p.id}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this project?")) return;
    await deleteProject(id);
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  const stats = useMemo(() => ({
    total: projects.length,
    complete: projects.filter(p => p.status === "complete").length,
    processing: projects.filter(p => p.status === "processing").length,
    youtube: projects.filter(p => p.source_type === "youtube").length,
  }), [projects]);

  const filtered = useMemo(() =>
    projects.filter(p => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (p.title || p.source_url || p.source_filename || "").toLowerCase().includes(q);
    })
  , [projects, search]);

  return (
    <div className="min-h-screen bg-bg-primary dark:bg-dark-bg-primary flex">
      {/* Sidebar */}
      <aside className="w-64 glass border-r border-border dark:border-dark-border flex flex-col p-4 fixed h-full z-10">
        <Link href="/" className="flex items-center gap-2.5 mb-8 px-2">
          <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center text-sm">🎬</div>
          <span className="font-semibold tracking-tight">VideoLM</span>
        </Link>

        <p className="text-[10px] text-text-muted dark:text-dark-text-muted uppercase tracking-wider font-semibold px-2 mb-2">Recent Projects</p>
        <div className="flex-1 overflow-y-auto space-y-1 min-h-0">
          {projects.slice(0, 15).map(p => (
            <div
              key={p.id}
              onClick={() => p.status === "complete" ? router.push(`/results/${p.id}`) : router.push(`/process/${p.id}`)}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-bg-hover dark:hover:bg-dark-bg-hover transition-all group"
            >
              <StatusIcon s={p.status} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-text-secondary dark:text-dark-text-secondary truncate">
                  {p.title || p.source_url?.slice(-30) || p.source_filename || "Video"}
                </p>
                <p className="text-[10px] text-text-disabled dark:text-dark-text-disabled">{formatRelative(p.created_at)}</p>
              </div>
            </div>
          ))}
          {!loading && projects.length === 0 && (
            <p className="text-xs text-text-disabled dark:text-dark-text-disabled px-3 py-2">No projects yet</p>
          )}
        </div>

        <div className="mt-auto pt-4 border-t border-border dark:border-dark-border">
          <div className="grid grid-cols-3 gap-2 px-1">
            <div className="text-center">
              <div className="text-sm font-bold text-text-primary dark:text-dark-text-primary">{stats.total}</div>
              <div className="text-[9px] text-text-disabled dark:text-dark-text-disabled uppercase">Total</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-bold text-success">{stats.complete}</div>
              <div className="text-[9px] text-text-disabled dark:text-dark-text-disabled uppercase">Done</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-bold text-accent">{stats.processing}</div>
              <div className="text-[9px] text-text-disabled dark:text-dark-text-disabled uppercase">Active</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 ml-64 p-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold gradient-text mb-1">New Analysis</h1>
              <p className="text-text-muted dark:text-dark-text-muted text-sm">Paste a YouTube URL or upload a video to begin AI analysis.</p>
            </div>
            <button onClick={toggleTheme} className="flex items-center justify-center w-9 h-9 rounded-xl bg-bg-secondary hover:bg-bg-hover text-text-muted hover:text-text-primary transition-all">
              {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            <div className="glass rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center">
                <LayoutGrid className="w-5 h-5 text-accent" />
              </div>
              <div>
                <div className="text-xl font-bold text-text-primary dark:text-dark-text-primary">{stats.total}</div>
                <div className="text-[10px] text-text-muted dark:text-dark-text-muted uppercase tracking-wider">Projects</div>
              </div>
            </div>
            <div className="glass rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-success/15 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-success" />
              </div>
              <div>
                <div className="text-xl font-bold text-text-primary dark:text-dark-text-primary">{stats.complete}</div>
                <div className="text-[10px] text-text-muted dark:text-dark-text-muted uppercase tracking-wider">Completed</div>
              </div>
            </div>
            <div className="glass rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-warning/15 flex items-center justify-center">
                <Youtube className="w-5 h-5 text-warning" />
              </div>
              <div>
                <div className="text-xl font-bold text-text-primary dark:text-dark-text-primary">{stats.youtube}</div>
                <div className="text-[10px] text-text-muted dark:text-dark-text-muted uppercase tracking-wider">YouTube</div>
              </div>
            </div>
          </div>

          {/* Input card */}
          <div className="glass rounded-2xl overflow-hidden mb-8">
            {/* Tabs */}
            <div className="flex border-b border-border dark:border-dark-border">
              {(["youtube","upload"] as const).map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={cn("flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium transition-all",
                    tab === t ? "text-accent border-b-2 border-accent bg-bg-card dark:bg-dark-bg-card" : "text-text-muted dark:text-dark-text-muted hover:text-text-primary dark:hover:text-dark-text-primary")}>
                  {t === "youtube" ? <Youtube className="w-4 h-4" /> : <FileVideo className="w-4 h-4" />}
                  {t === "youtube" ? "YouTube URL" : "Upload Video"}
                </button>
              ))}
            </div>

            <div className="p-6">
              <AnimatePresence mode="wait">
                {tab === "youtube" ? (
                  <motion.div key="yt" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }} className="space-y-4">
                    <div className="relative">
                      <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted dark:text-dark-text-muted" />
                      <input
                        value={ytUrl} onChange={e => handleYtChange(e.target.value)}
                        placeholder="https://youtube.com/watch?v=..."
                        className="w-full bg-bg-secondary dark:bg-dark-bg-secondary border border-border dark:border-dark-border focus:border-accent/60 rounded-xl pl-10 pr-4 py-3 text-sm text-text-primary dark:text-dark-text-primary placeholder:text-text-muted dark:placeholder:text-dark-text-muted outline-none transition-colors"
                      />
                      {ytLoading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent animate-spin" />}
                    </div>

                    {ytUrl && <p className={cn("text-xs", isValidYouTube(ytUrl) ? "text-success" : "text-error")}>
                      {isValidYouTube(ytUrl) ? "✓ Valid YouTube URL" : "✗ Invalid URL"}
                    </p>}

                    {ytInfo && (
                      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-bg-secondary dark:bg-dark-bg-secondary rounded-xl p-4 flex gap-3">
                        {(ytInfo.thumbnail as string) && <img src={ytInfo.thumbnail as string} alt="" className="w-20 h-14 object-cover rounded-lg flex-shrink-0" />}
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-text-primary dark:text-dark-text-primary truncate">{ytInfo.title as string}</p>
                          <p className="text-xs text-text-muted dark:text-dark-text-muted mt-0.5">{ytInfo.uploader as string}</p>
                        {(ytInfo.duration as number) && <p className="text-xs text-text-muted dark:text-dark-text-muted">{formatDuration(ytInfo.duration as number)}</p>}
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div key="up" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}>
                    <div {...getRootProps()} className={cn(
                      "border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all",
                      isDragActive ? "border-accent bg-accent/5" : "border-border dark:border-dark-border hover:border-accent/40"
                    )}>
                      <input {...getInputProps()} />
                      <FileVideo className="w-8 h-8 text-text-muted dark:text-dark-text-muted mx-auto mb-3" />
                      {acceptedFiles[0] ? (
                        <p className="text-sm text-text-primary dark:text-dark-text-primary font-medium">{acceptedFiles[0].name}</p>
                      ) : (
                        <>
                          <p className="text-sm text-text-secondary dark:text-dark-text-secondary">Drop video here or <span className="text-accent">browse</span></p>
                          <p className="text-xs text-text-disabled dark:text-dark-text-disabled mt-1">MP4 · AVI · MOV · WebM · MKV · Max 2GB</p>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {error && <div className="mt-4 text-sm text-error bg-error/10 border border-error/20 rounded-xl px-4 py-3">{error}</div>}

              <button
                onClick={tab === "youtube" ? handleYtSubmit : handleFileSubmit}
                disabled={submitting || (tab === "youtube" && !isValidYouTube(ytUrl)) || (tab === "upload" && !acceptedFiles[0])}
                className="mt-5 w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submitting ? <><Loader2 className="w-4 h-4 animate-spin" />Submitting…</> : <><Play className="w-4 h-4 fill-white" />Start AI Analysis</>}
              </button>
            </div>
          </div>

          {/* All projects with search */}
          {projects.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs text-text-muted dark:text-dark-text-muted uppercase tracking-wider font-semibold">All Projects</p>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted dark:text-dark-text-muted" />
                  <input
                    value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search projects…"
                    className="bg-bg-secondary dark:bg-dark-bg-secondary border border-border dark:border-dark-border focus:border-accent/50 rounded-lg pl-8 pr-3 py-1.5 text-xs text-text-primary dark:text-dark-text-primary placeholder:text-text-muted dark:placeholder:text-dark-text-muted outline-none transition-colors w-48"
                  />
                </div>
              </div>
              <div className="space-y-2">
                {filtered.length === 0 && (
                  <div className="text-center py-8 text-text-muted dark:text-dark-text-muted text-sm">No projects match "{search}"</div>
                )}
                {filtered.map((p, i) => {
                  const sc = STATUS_COLORS[p.status];
                  return (
                    <motion.div key={p.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                      onClick={() => p.status === "complete" ? router.push(`/results/${p.id}`) : router.push(`/process/${p.id}`)}
                      className="glass rounded-xl px-4 py-3.5 flex items-center gap-3 cursor-pointer hover:border-accent/30 hover:-translate-y-0.5 transition-all duration-200 group">
                      <StatusIcon s={p.status} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-sm font-medium text-text-primary dark:text-dark-text-primary truncate max-w-sm">
                            {p.title || p.source_url || p.source_filename || "Untitled"}
                          </p>
                          <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full border flex-shrink-0", sc.text, sc.bg, sc.border)}>
                            {p.status}
                          </span>
                        </div>
                        {p.status === "processing" && (
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1 bg-bg-hover dark:bg-dark-bg-hover rounded-full overflow-hidden">
                              <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${p.progress}%` }} />
                            </div>
                            <span className="text-[10px] text-text-muted dark:text-dark-text-muted font-mono">{p.progress}%</span>
                          </div>
                        )}
                        {p.status !== "processing" && (
                          <p className="text-xs text-text-muted dark:text-dark-text-muted">
                            {p.source_type === "youtube" ? "YouTube" : "Local"} · {formatRelative(p.created_at)}
                            {p.duration_seconds ? ` · ${formatDuration(p.duration_seconds)}` : ""}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {p.status === "complete" && <ArrowRight className="w-4 h-4 text-accent" />}
                        <button onClick={e => handleDelete(p.id, e)} className="p-1.5 rounded-lg hover:bg-error/10 text-text-disabled dark:text-dark-text-disabled hover:text-error transition-all">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Empty state */}
          {!loading && projects.length === 0 && (
            <div className="glass rounded-2xl p-12 text-center">
              <div className="w-14 h-14 rounded-2xl bg-accent/15 flex items-center justify-center mx-auto mb-4">
                <Film className="w-7 h-7 text-accent" />
              </div>
              <p className="text-text-secondary dark:text-dark-text-secondary font-medium mb-1">No projects yet</p>
              <p className="text-text-muted dark:text-dark-text-muted text-sm">Submit a YouTube URL or upload a video above to get started.</p>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
