'use client';

import { useState } from 'react';
import { Lock, CheckCircle2, ChevronRight } from 'lucide-react';
import { Language, Concept } from '@/types';
import { useProgress } from '@/hooks/useProgress';
import { LanguageIcon } from '@/components/LanguageIcon';
import { LevelIcon } from '@/components/icons/LevelIcon';

interface Props {
  language: Language;
  onSelectExercise: (concept: Concept, exerciseNumber: number) => void;
}

export function LevelSelector({ language, onSelectExercise }: Props) {
  const [activeTab, setActiveTab] = useState(0);
  const { getConceptProgress, isUnlocked, getLanguageStats } = useProgress();

  const level = language.levels[activeTab];
  const langStats = getLanguageStats(language.name);
  const conceptIds = level.concepts.map(c => c.id);

  function getNextExercise(conceptId: string): number {
    const cp = getConceptProgress(language.name, conceptId);
    if (!cp) return 1;
    for (let i = 1; i <= 3; i++) {
      if (!cp.completedExercises.includes(i)) return i;
    }
    return 1;
  }

  return (
    <div className="max-w-3xl mx-auto">

      {/* ── Header ── */}
      <div className="flex items-center gap-4 mb-6">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{
            background: `linear-gradient(135deg, ${language.accentColor}20, ${language.accentColor}05)`,
            border: `1px solid ${language.accentColor}40`,
          }}
        >
          <LanguageIcon name={language.icon} size={34} />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>
            {language.name}
          </h2>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-muted-foreground">
              {langStats.dominated} dominados
            </span>
            <span className="text-xs text-muted-foreground">·</span>
            <span className="text-xs text-muted-foreground">
              {langStats.totalExercises} ejercicios completados
            </span>
          </div>
        </div>
      </div>

      {/* ── Level tabs ── */}
      <div className="flex gap-1.5 mb-6 p-1 rounded-xl" style={{ background: 'var(--muted)' }}>
        {language.levels.map((lvl, i) => {
          const isActive = activeTab === i;
          return (
            <button
              key={lvl.id}
              onClick={() => setActiveTab(i)}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-200"
              style={{
                background: isActive ? 'var(--card)' : 'transparent',
                color: isActive ? 'var(--foreground)' : 'var(--muted-foreground)',
                boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              <LevelIcon
                id={lvl.id}
                size={15}
                color={isActive ? language.accentColor : 'var(--muted-foreground)'}
              />
              <span className="hidden sm:inline">{lvl.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Level description ── */}
      <div className="flex items-center gap-2 mb-5">
        <LevelIcon id={level.id} size={18} color={language.accentColor} />
        <div>
          <h3 className="text-base font-semibold" style={{ color: 'var(--foreground)' }}>
            {level.label}
          </h3>
          <p className="text-sm text-muted-foreground">{level.description}</p>
        </div>
      </div>

      {/* ── Concept cards ── */}
      <div className="flex flex-col gap-3">
        {level.concepts.map((concept) => {
          const cp = getConceptProgress(language.name, concept.id);
          const unlocked = isUnlocked(language.name, level.id, concept.id, conceptIds);
          const completedCount = cp?.completedExercises.length ?? 0;
          const dominated = cp?.dominated ?? false;
          const nextEx = getNextExercise(concept.id);

          return (
            <button
              key={concept.id}
              onClick={() => { if (unlocked) onSelectExercise(concept, nextEx); }}
              disabled={!unlocked}
              className="group relative rounded-xl p-4 text-left transition-all duration-200"
              style={{
                background: dominated
                  ? `linear-gradient(135deg, ${language.accentColor}08, var(--card))`
                  : 'var(--card)',
                border: `1px solid ${dominated ? language.accentColor + '40' : 'var(--border)'}`,
                opacity: unlocked ? 1 : 0.55,
                cursor: unlocked ? 'pointer' : 'not-allowed',
              }}
            >
              <div className="flex items-center gap-4">

                {/* Estado */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: !unlocked
                      ? 'var(--muted)'
                      : dominated
                        ? `${language.accentColor}18`
                        : 'var(--muted)',
                    border: `1px solid ${dominated ? language.accentColor + '30' : 'var(--border)'}`,
                  }}
                >
                  {!unlocked ? (
                    <Lock className="w-4 h-4 text-muted-foreground" />
                  ) : dominated ? (
                    <CheckCircle2 className="w-5 h-5" style={{ color: language.accentColor }} />
                  ) : (
                    <span className="text-xs font-bold text-muted-foreground">{completedCount}/3</span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                      {concept.label}
                    </span>
                    {dominated && (
                      <span
                        className="text-[10px] font-bold tracking-wide px-2 py-0.5 rounded-full uppercase"
                        style={{
                          background: `${language.accentColor}15`,
                          color: language.accentColor,
                          border: `1px solid ${language.accentColor}30`,
                        }}
                      >
                        Dominado
                      </span>
                    )}
                  </div>
                  {/* Dots de progreso */}
                  <div className="flex items-center gap-1.5 mt-1.5">
                    {[1, 2, 3].map(ex => {
                      const done = cp?.completedExercises.includes(ex) ?? false;
                      return (
                        <div
                          key={ex}
                          className="w-2.5 h-2.5 rounded-full transition-colors"
                          style={{
                            background: done ? language.accentColor : 'var(--border)',
                            boxShadow: done ? `0 0 6px ${language.accentColor}40` : 'none',
                          }}
                        />
                      );
                    })}
                    <span className="text-xs text-muted-foreground ml-1.5">
                      {completedCount}/3 ejercicios
                    </span>
                  </div>
                </div>

                {/* Flecha */}
                {unlocked && (
                  <ChevronRight className="w-4 h-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                )}
              </div>

              {/* Stats del concepto */}
              {cp && cp.bestWpm > 0 && (
                <div className="flex gap-4 mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                  <span className="text-xs text-muted-foreground">
                    Mejor: <span className="font-mono font-semibold" style={{ color: 'var(--foreground)' }}>{cp.bestWpm} WPM</span>
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Precisión: <span className="font-mono font-semibold" style={{ color: 'var(--foreground)' }}>{cp.bestAccuracy}%</span>
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}