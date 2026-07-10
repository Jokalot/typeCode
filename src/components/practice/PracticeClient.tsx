'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Trophy, Lightbulb, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatsSection } from '@/components/StatsSection';
import { TypingPractice } from '@/components/TypingPractice';
import { LevelSelector } from '@/components/practice/LevelSelector';
import { useSession } from '@/hooks/useSession';
import { useProgress } from '@/hooks/useProgress';
import { useSyncProgress } from '@/hooks/useSyncProgress';
import { Language, Concept, LevelId } from '@/types';
import { useKeyboardConfig } from '@/hooks/useKeyboardConfig';
import { KeyboardSetupModal } from '@/components/practice/KeyboardSetupModal';

interface Props {
  language: Language;
}

interface ActiveExercise {
  concept: Concept;
  exerciseNumber: number;
  levelId: LevelId;
}

interface CompletedResult {
  wpm: number;
  accuracy: number;
  errors: number;
  concept: Concept;
  exerciseNumber: number;
  levelId: LevelId;
}

export function PracticeClient({ language }: Props) {
  const router = useRouter();
  const { saveSession } = useSession();
  const { completeExercise } = useProgress();
  const { configured, finishConfig } = useKeyboardConfig();
  useSyncProgress();

  const [active, setActive] = useState<ActiveExercise | null>(null);
  const [result, setResult] = useState<CompletedResult | null>(null);

  const findLevelId = useCallback((conceptId: string): LevelId => {
    for (const level of language.levels) {
      if (level.concepts.some(c => c.id === conceptId)) {
        return level.id;
      }
    }
    return 'fundamentos';
  }, [language.levels]);

  const handleSelectExercise = useCallback((concept: Concept, exerciseNumber: number) => {
    const levelId = findLevelId(concept.id);
    setActive({ concept, exerciseNumber, levelId });
    setResult(null);
  }, [findLevelId]);

  const handleSessionComplete = useCallback((
    stats: { wpm: number; accuracy: number; errors: number },
    _snippet: unknown,
    mode: 'speed' | 'learn',
  ) => {
    if (!active) return;

    saveSession({
      language: language.name,
      concept: active.concept.label,
      wpm: stats.wpm,
      accuracy: stats.accuracy,
      errors: stats.errors,
      mode,
    });

    completeExercise(
      language.name,
      active.levelId,
      active.concept.id,
      active.exerciseNumber,
      stats.accuracy,
      stats.wpm,
    );

    setResult({
      ...stats,
      concept: active.concept,
      exerciseNumber: active.exerciseNumber,
      levelId: active.levelId,
    });
  }, [active, language.name, saveSession, completeExercise]);

  const handleNext = useCallback(() => {
    if (!result) return;
    const next = result.exerciseNumber + 1;
    if (next <= 3) {
      setActive({ concept: result.concept, exerciseNumber: next, levelId: result.levelId });
      setResult(null);
    } else {
      setActive(null);
      setResult(null);
    }
  }, [result]);

  const handleBackToMap = useCallback(() => {
    setActive(null);
    setResult(null);
  }, []);

  // Aún cargando localStorage
  if (configured === null) return null;

  // Primera vez → modal de configuración
  if (configured === false) {
    return <KeyboardSetupModal onComplete={finishConfig} />;
  }

  // ── STATE 1: Selector de niveles ──
  if (!active) {
    return (
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push('/')} className="gap-1">
            <ChevronLeft className="w-4 h-4" />
            Lenguajes
          </Button>
        </div>
        <StatsSection />
        <LevelSelector
          language={language}
          onSelectExercise={handleSelectExercise}
        />
      </div>
    );
  }

  const snippet = active.concept.snippets.find(s => s.exerciseNumber === active.exerciseNumber)
    ?? active.concept.snippets[0];

  // ── STATE 2: Ejercicio activo ──
  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
      {/* Breadcrumb */}
      <div className="mb-3 sm:mb-4 flex items-center gap-1.5 sm:gap-2 text-xs text-muted-foreground flex-wrap">
        <button onClick={handleBackToMap} className="hover:text-foreground transition-colors">
          {language.name}
        </button>
        <ChevronRight className="w-3 h-3" />
        <span>{active.concept.label}</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground font-medium">Ejercicio {active.exerciseNumber}</span>
      </div>

      {snippet.explanation && (
        <div
          className="mb-4 px-4 py-3 rounded-xl text-sm"
          style={{
            background: `${language.accentColor}08`,
            border: `1px solid ${language.accentColor}20`,
            color: 'var(--foreground)',
          }}
        >
          <span className="font-medium" style={{ color: language.accentColor }}><Lightbulb className="w-3.5 h-3.5 inline-block mr-1" style={{ color: language.accentColor }} /></span>
          {snippet.explanation}
        </div>
      )}

      <TypingPractice
        snippets={[snippet]}
        concept={active.concept}
        exerciseNumber={active.exerciseNumber}
        language={language.name}
        accentColor={language.accentColor}
        onBack={handleBackToMap}
        onSessionComplete={handleSessionComplete}
      />

      {result && (
        <div
          className="mt-4 sm:mt-6 rounded-xl p-3 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: result.accuracy >= 80 ? `${language.accentColor}15` : 'var(--muted)' }}
            >
              <Trophy
                className="w-5 h-5"
                style={{ color: result.accuracy >= 80 ? language.accentColor : 'var(--muted-foreground)' }}
              />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                {result.accuracy >= 80 ? '¡Excelente trabajo!' : 'Sigue practicando'}
              </p>
              <p className="text-xs text-muted-foreground">
                {result.concept.label} · Ejercicio {result.exerciseNumber}/3
              </p>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" size="sm" onClick={handleBackToMap} className="gap-1.5">
              <ArrowLeft className="w-3.5 h-3.5" /> Mapa
            </Button>
            {result.exerciseNumber < 3 ? (
              <Button
                size="sm"
                onClick={handleNext}
                style={{ background: language.accentColor, color: '#fff', border: 'none' }}
              >
                Siguiente ejercicio <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleBackToMap}
                style={{ background: language.accentColor, color: '#fff', border: 'none' }}
              >
                Volver al mapa <Check className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}