'use client';

import { useEffect, useRef } from 'react';
import { RotateCw, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { LanguageIcon } from './LanguageIcon';
import { useTypingEngine } from '@/hooks/useTypingEngine';
import { Snippet, Concept } from '@/types';
import { useState } from 'react';
import { CheatsheetPanel } from './practice/CheatsheetPanel';
import { ExerciseInfoPanel } from './practice/ExerciseInfoPanel';



interface Props {
  snippets: Snippet[];
  language: string;
  accentColor: string;
  onBack: () => void;
  concept?: Concept;
  exerciseNumber?: number;
  onSessionComplete?: (
    stats: { wpm: number; accuracy: number; errors: number },
    snippet: Snippet,
    mode: 'speed' | 'learn'
  ) => void;
}


type Mode = 'speed' | 'learn';
const TIME_OPTIONS = [30, 60, 120];

export function TypingPractice({ snippets, language, accentColor, onBack, onSessionComplete, concept, exerciseNumber }: Props) {
  const [snippetIdx, setSnippetIdx] = useState(0);
  const [mode, setMode] = useState<Mode>('speed');
  const [timeLimit, setTimeLimit] = useState(60);
  const [showCheatsheet, setShowCheatsheet] = useState(false);
  const [showExerciseInfo, setShowExerciseInfo] = useState(false);

  const snippet = snippets[snippetIdx];
  const displayRef = useRef<HTMLDivElement>(null);

  const {
    charStates, cursor, errors, wpm,
    accuracy, progress, timeLeft,
    started, finished, handleKeyDown, reset,
  } = useTypingEngine({
    code: snippet.code,
    mode,
    timeLimit,
    onFinish: (stats) => {
      onSessionComplete?.(stats, snippet, mode);
    },
  });

  const chars = snippet.code.split('');

  // Adjunta el listener global de teclado
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Scroll del cursor a la vista
  useEffect(() => {
    displayRef.current
      ?.querySelector('[data-cursor="true"]')
      ?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [cursor]);

  const nextSnippet = () => setSnippetIdx(i => (i + 1) % snippets.length);
  const prevSnippet = () => setSnippetIdx(i => (i - 1 + snippets.length) % snippets.length);


  return (
    <div className="flex flex-col">
      {/* Top bar */}
      <div className="mb-3 sm:mb-4 flex flex-wrap items-center justify-between gap-2">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1">
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Volver</span>
        </Button>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Tabs modo */}
          <div className="flex gap-1 bg-muted rounded-lg p-1">
            {(['speed', 'learn'] as Mode[]).map(m => (
              <button key={m} onClick={() => { setMode(m); reset(); }}
                className={`px-2 sm:px-3 py-1.5 rounded-md text-xs font-medium transition-all ${mode === m ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  }`}>
                {m === 'speed' ? '⏱ Speed' : '📘 Learn'}
              </button>
            ))}
          </div>
          {mode === 'speed' && (
            <div className="flex gap-1 bg-muted rounded-lg p-1">
              {TIME_OPTIONS.map(t => (
                <button key={t} onClick={() => setTimeLimit(t)}
                  className={`px-2 sm:px-3 py-1.5 rounded-md text-xs font-medium transition-all ${timeLimit === t ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                    }`}>
                  {t}s
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Layout: 3 columns on desktop, stacked on mobile */}
      <div className="flex flex-col lg:flex-row gap-4 items-start">

        {/* Left: Cheatsheet — hidden on mobile, shown as panel on desktop */}
        <div className="hidden lg:block">
          <CheatsheetPanel code={snippet.code} accentColor={accentColor} />
        </div>

        {/* Center: Editor */}
        <div className="flex-1 min-w-0 w-full">
          {/* Snippet info */}
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <LanguageIcon name={language.toLowerCase()} size={20} />
            <div className="min-w-0 flex-1">
              <span className="text-sm font-medium">{language}</span>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                  style={{ background: `${accentColor}18`, color: accentColor }}>
                  {snippet.concept}
                </span>
                <span className="text-xs text-muted-foreground">{snippet.difficulty}</span>
              </div>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <Button variant="ghost" size="sm" onClick={prevSnippet} disabled={snippets.length <= 1}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={nextSnippet} disabled={snippets.length <= 1}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-3 sm:mb-4">
            {[
              { label: 'WPM', value: wpm, accent: true },
              { label: 'Precisión', value: `${accuracy}%`, danger: accuracy < 90 && started },
              { label: mode === 'speed' ? 'Tiempo' : 'Modo', value: mode === 'speed' ? timeLeft : '∞', warn: mode === 'speed' && timeLeft <= 10 && started },
              { label: 'Errores', value: errors, danger: errors > 5 },
            ].map((s, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-2.5 sm:p-3">
                <div className="text-xs text-muted-foreground mb-0.5 sm:mb-1">{s.label}</div>
                <div className={`text-lg sm:text-xl font-medium font-mono ${s.danger ? 'text-destructive' : s.warn ? 'text-yellow-500' : ''
                  }`} style={s.accent ? { color: accentColor } : {}}>
                  {s.value}
                </div>
              </div>
            ))}
          </div>

          <Progress value={progress} className="h-1.5 mb-3 sm:mb-4" />

          {/* Editor */}
          <div className="bg-card border border-border rounded-xl overflow-hidden mb-3 relative">
            <div className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 border-b border-border">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
              <span className="text-xs text-muted-foreground font-mono ml-1 truncate">
                {snippet.concept}.{language.toLowerCase()}
              </span>
              <Button variant="ghost" size="sm" onClick={reset} className="ml-auto flex-shrink-0">
                <RotateCw className="w-3.5 h-3.5" />
              </Button>
            </div>
            <div ref={displayRef}
              className="p-3 sm:p-6 font-mono text-xs sm:text-sm leading-7 sm:leading-8 whitespace-pre overflow-x-auto select-none min-h-[120px] sm:min-h-[160px]"
              style={{ background: '#1a1714' }}>
              {chars.map((ch, i) => {
                const state = charStates[i];
                const isCursor = i === cursor && !finished;
                return (
                  <span key={i} data-cursor={isCursor || undefined} style={{
                    color: state === 'correct' ? '#8fc78a' : state === 'wrong' ? '#ff5f57' : '#4a4a5a',
                    background: state === 'wrong' ? 'rgba(255,95,87,0.1)' : undefined,
                    borderLeft: isCursor ? `2px solid ${accentColor}` : undefined,
                    marginLeft: isCursor ? '-1px' : undefined,
                    animation: isCursor ? 'cursorBlink 1s step-end infinite' : undefined,
                  }}>
                    {ch}
                  </span>
                );
              })}
            </div>

            {finished && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 sm:gap-4 p-4"
                style={{ background: 'rgba(26,23,20,0.95)' }}>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Resultado</p>
                <p className="text-4xl sm:text-5xl font-bold font-mono" style={{ color: accentColor }}>{wpm}</p>
                <div className="flex gap-4 sm:gap-6 text-xs sm:text-sm text-muted-foreground flex-wrap justify-center">
                  <span>{accuracy}% precisión</span>
                  <span>{errors} errores</span>
                  <span style={{ color: accentColor }}>WPM</span>
                </div>
                <div className="flex gap-2 mt-2 flex-wrap justify-center">
                  <Button onClick={reset} style={{ background: accentColor, color: '#fff', border: 'none' }}>
                    ↺ Reintentar
                  </Button>
                  <Button variant="outline" onClick={nextSnippet}>
                    Siguiente →
                  </Button>
                </div>
              </div>
            )}
          </div>

          <p className="text-center text-xs text-muted-foreground hidden sm:block">
            <kbd className="bg-muted px-1.5 py-0.5 rounded text-xs">tab</kbd> reiniciar ·{' '}
            <kbd className="bg-muted px-1.5 py-0.5 rounded text-xs">esc</kbd> volver ·{' '}
            empieza a escribir para comenzar
          </p>

          {/* Mobile: toggle buttons for side panels */}
          <div className="flex gap-2 mt-3 lg:hidden">
            <button
              onClick={() => { setShowCheatsheet(!showCheatsheet); setShowExerciseInfo(false); }}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all"
              style={{
                background: showCheatsheet ? `${accentColor}12` : 'var(--muted)',
                border: `1px solid ${showCheatsheet ? accentColor + '40' : 'var(--border)'}`,
                color: showCheatsheet ? accentColor : 'var(--muted-foreground)',
              }}
            >
              ⌨️ Cheatsheet
              {showCheatsheet ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
            {concept && (
              <button
                onClick={() => { setShowExerciseInfo(!showExerciseInfo); setShowCheatsheet(false); }}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all"
                style={{
                  background: showExerciseInfo ? `${accentColor}12` : 'var(--muted)',
                  border: `1px solid ${showExerciseInfo ? accentColor + '40' : 'var(--border)'}`,
                  color: showExerciseInfo ? accentColor : 'var(--muted-foreground)',
                }}
              >
                📋 Info
                {showExerciseInfo ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            )}
          </div>

          {/* Mobile: Cheatsheet expanded */}
          {showCheatsheet && (
            <div className="mt-3 lg:hidden">
              <CheatsheetPanel code={snippet.code} accentColor={accentColor} />
            </div>
          )}

          {/* Mobile: ExerciseInfo expanded */}
          {showExerciseInfo && concept && (
            <div className="mt-3 lg:hidden">
              <ExerciseInfoPanel
                snippet={snippet}
                concept={concept}
                exerciseNumber={exerciseNumber ?? snippetIdx + 1}
                language={language}
                accentColor={accentColor}
              />
            </div>
          )}
        </div>

        {/* Right: ExerciseInfo — hidden on mobile */}
        {concept && (
          <div className="hidden lg:flex">
            <ExerciseInfoPanel
              snippet={snippet}
              concept={concept}
              exerciseNumber={exerciseNumber ?? snippetIdx + 1}
              language={language}
              accentColor={accentColor}
            />
          </div>
        )}
      </div>

      <style>{`
      @keyframes cursorBlink {
        0%, 100% { border-left-color: ${accentColor}; }
        50% { border-left-color: transparent; }
      }
    `}</style>
    </div>
  )
}