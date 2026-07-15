"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Loader2, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGenerationJob, JobProgressBar } from "@/hooks/useGenerationJob";

interface Card { id: string; front: string; back: string; concept: string; }
interface Props {
  projectId: string;
  existingData: { flashcards: Card[]; total: number } | null;
  onGenerated: () => void;
}

export default function FlashcardPanel({ projectId, existingData, onGenerated }: Props) {
  const [cards, setCards]   = useState<Card[]>(existingData?.flashcards || []);
  const [flipped, setFlipped] = useState<Set<string>>(new Set());
  const [idx, setIdx]       = useState(0);
  const [mode, setMode]     = useState<"grid" | "study">("grid");

  const job = useGenerationJob((r: unknown) => {
    const res = r as { flashcards: Card[] };
    if (res?.flashcards) { setCards(res.flashcards); setFlipped(new Set()); onGenerated(); }
  });

  const running = job.status === "running" || job.status === "pending";

  const flip = (id: string) =>
    setFlipped(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const generate = () =>
    job.start(`/api/generate/${projectId}/flashcards`, { num_cards: 20 });

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-text-primary dark:text-dark-text-primary">
            Flashcards
          </h2>
          {cards.length > 0 && (
            <p className="text-xs text-text-muted dark:text-dark-text-muted mt-0.5">{cards.length} cards · click a card to reveal the answer</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {cards.length > 0 && (
            <button
              onClick={() => { setMode(m => m === "grid" ? "study" : "grid"); setFlipped(new Set()); setIdx(0); }}
              className="text-xs text-text-muted dark:text-dark-text-muted hover:text-text-primary dark:hover:text-dark-text-primary bg-bg-hover dark:bg-dark-bg-hover hover:bg-bg-hover dark:hover:bg-dark-bg-hover px-3 py-1.5 rounded-lg transition-all"
            >
              {mode === "grid" ? "📖 Study Mode" : "⊞ Grid Mode"}
            </button>
          )}
          <button
            onClick={generate}
            disabled={running}
            className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white text-sm font-medium px-4 py-2 rounded-xl transition-all disabled:opacity-50"
          >
            {running
              ? <><Loader2 className="w-4 h-4 animate-spin" />Generating…</>
              : <><Sparkles className="w-4 h-4" />{cards.length ? "Regenerate" : "Generate Flashcards"}</>}
          </button>
        </div>
      </div>

      <JobProgressBar status={job.status} progress={job.progress} message={job.message} error={job.error} />

      {/* Empty state */}
      {cards.length === 0 && job.status === "idle" && (
        <div className="flex items-center justify-center rounded-2xl border border-dashed border-border dark:border-dark-border py-20">
          <div className="text-center">
            <div className="text-5xl mb-3">🃏</div>
            <p className="text-text-muted dark:text-dark-text-muted text-sm mb-1 font-medium">No flashcards yet</p>
            <p className="text-xs text-text-disabled dark:text-dark-text-disabled max-w-xs mx-auto">
              Generates concept-based cards with full definitions and context from the video transcript.
            </p>
            <button
              onClick={generate}
              className="mt-5 flex items-center gap-2 mx-auto bg-accent text-white text-sm font-medium px-6 py-2.5 rounded-xl"
            >
              <Sparkles className="w-4 h-4" /> Generate Flashcards
            </button>
          </div>
        </div>
      )}

      {/* Grid mode */}
      {cards.length > 0 && mode === "grid" && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map(card => (
            <div
              key={card.id}
              onClick={() => flip(card.id)}
              className="cursor-pointer"
              style={{ perspective: "1000px" }}
            >
              <motion.div
                animate={{ rotateY: flipped.has(card.id) ? 180 : 0 }}
                transition={{ duration: 0.4, type: "spring", stiffness: 120 }}
                style={{ transformStyle: "preserve-3d" }}
                className="relative min-h-[170px]"
              >
                {/* Front */}
                <div
                  className="absolute inset-0 bg-bg-secondary dark:bg-dark-bg-secondary border border-border dark:border-dark-border rounded-2xl p-5 flex flex-col justify-between"
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <span className="text-[10px] text-accent font-bold uppercase tracking-widest">
                    {card.concept}
                  </span>
                  <p className="text-sm text-text-primary dark:text-dark-text-primary font-semibold leading-relaxed">{card.front}</p>
                  <span className="text-[10px] text-text-disabled dark:text-dark-text-disabled flex items-center gap-1">
                    <RotateCcw className="w-2.5 h-2.5" /> Click to reveal answer
                  </span>
                </div>
                {/* Back */}
                <div
                  className="absolute inset-0 bg-accent/10 border border-accent/25 rounded-2xl p-5 flex flex-col justify-center overflow-hidden"
                  style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                >
                  <p className="text-xs text-text-secondary dark:text-dark-text-secondary leading-relaxed">{card.back}</p>
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      )}

      {/* Study mode */}
      {cards.length > 0 && mode === "study" && (
        <div className="max-w-lg mx-auto">
          {/* Progress bar */}
          <div className="flex items-center justify-between mb-4 text-xs text-text-muted dark:text-dark-text-muted">
            <span>Card {idx + 1} of {cards.length}</span>
            <span>{Math.round(((idx + 1) / cards.length) * 100)}% complete</span>
          </div>
          <div className="h-1 bg-bg-hover dark:bg-dark-bg-hover rounded-full overflow-hidden mb-6">
            <div
              className="h-full bg-accent rounded-full transition-all"
              style={{ width: `${((idx + 1) / cards.length) * 100}%` }}
            />
          </div>

          {/* Card */}
          <div
            onClick={() => flip(cards[idx].id)}
            className="cursor-pointer"
            style={{ perspective: "1200px" }}
          >
            <motion.div
              animate={{ rotateY: flipped.has(cards[idx].id) ? 180 : 0 }}
              transition={{ duration: 0.45, type: "spring", stiffness: 100 }}
              style={{ transformStyle: "preserve-3d" }}
              className="relative h-72"
            >
              {/* Front */}
              <div
                className="absolute inset-0 bg-bg-secondary dark:bg-dark-bg-secondary border border-border dark:border-dark-border rounded-2xl p-8 flex flex-col items-center justify-center text-center"
                style={{ backfaceVisibility: "hidden" }}
              >
                <span className="text-[10px] text-accent font-bold uppercase tracking-widest mb-4">
                  {cards[idx].concept}
                </span>
                <p className="text-lg font-semibold text-text-primary dark:text-dark-text-primary leading-relaxed">{cards[idx].front}</p>
                <p className="text-xs text-text-disabled dark:text-dark-text-disabled mt-6 flex items-center gap-1">
                  <RotateCcw className="w-3 h-3" /> Click to flip
                </p>
              </div>
              {/* Back */}
              <div
                className="absolute inset-0 bg-accent/10 border border-accent/25 rounded-2xl p-8 flex flex-col justify-center text-center overflow-y-auto"
                style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
              >
                <p className="text-sm text-text-secondary dark:text-dark-text-secondary leading-relaxed">{cards[idx].back}</p>
              </div>
            </motion.div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={() => { setIdx(i => Math.max(0, i - 1)); setFlipped(new Set()); }}
              disabled={idx === 0}
              className="px-6 py-2.5 text-sm font-medium text-text-muted dark:text-dark-text-muted hover:text-text-primary dark:hover:text-dark-text-primary disabled:opacity-30 transition-colors bg-bg-hover dark:bg-dark-bg-hover rounded-xl"
            >
              ← Previous
            </button>
            <button
              onClick={() => { setFlipped(new Set()); flip(cards[idx].id); }}
              className="text-xs text-text-muted dark:text-dark-text-muted hover:text-text-secondary dark:text-dark-text-secondary transition-colors"
            >
              Flip card
            </button>
            <button
              onClick={() => { setIdx(i => Math.min(cards.length - 1, i + 1)); setFlipped(new Set()); }}
              disabled={idx === cards.length - 1}
              className="px-6 py-2.5 text-sm font-medium text-white bg-accent hover:bg-accent-hover disabled:opacity-40 rounded-xl transition-all"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
