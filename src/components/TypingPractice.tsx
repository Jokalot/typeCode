'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { RotateCw, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Timer, BookOpen, ArrowRight, Keyboard, ClipboardList, Terminal, Lightbulb, Info } from 'lucide-react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { LanguageIcon } from './LanguageIcon';
import { useTypingEngine } from '@/hooks/useTypingEngine';
import { Snippet, Concept } from '@/types';
import { CheatsheetPanel } from './practice/CheatsheetPanel';
import { ExerciseInfoPanel } from './practice/ExerciseInfoPanel';
import { stripComments } from '@/lib/utils';



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

type EditorSize = 'S' | 'M' | 'L' | 'XL';
const SIZE_OPTIONS: EditorSize[] = ['S', 'M', 'L', 'XL'];
const SIZE_PX: Record<EditorSize, number> = { S: 11, M: 13, L: 15, XL: 18 };
const EDITOR_SIZE_STORAGE_KEY = 'codetype_editor_size';

export function TypingPractice({ snippets, language, accentColor, onBack, onSessionComplete, concept, exerciseNumber }: Props) {
  const [snippetIdx, setSnippetIdx] = useState(0);
  const [mode, setMode] = useState<Mode>('speed');
  const [timeLimit, setTimeLimit] = useState(60);
  const [showCheatsheet, setShowCheatsheet] = useState(false);
  const [showExerciseInfo, setShowExerciseInfo] = useState(false);
  const [editorSize, setEditorSize] = useState<EditorSize>('M');
  const [showInfoTooltip, setShowInfoTooltip] = useState(false);
  const infoRef = useRef<HTMLDivElement>(null);

  const snippet = snippets[snippetIdx];
  const displayRef = useRef<HTMLDivElement>(null);
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  const code = useMemo(() => stripComments(snippet.code, language), [snippet.code, language]);

  const {
    charStates, cursor, errors, wpm,
    accuracy, progress, timeLeft,
    started, finished, handleKeyDown, reset,
  } = useTypingEngine({
    code,
    mode,
    timeLimit,
    onFinish: (stats) => {
      onSessionComplete?.(stats, snippet, mode);
    },
  });

  const chars = code.split('');

  // Carga el tamaño de fuente guardado en localStorage
  useEffect(() => {
    const stored = localStorage.getItem(EDITOR_SIZE_STORAGE_KEY) as EditorSize | null;
    if (stored && SIZE_OPTIONS.includes(stored)) {
      setEditorSize(stored);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(EDITOR_SIZE_STORAGE_KEY, editorSize);
  }, [editorSize]);

  // Cierra el tooltip de explicación al hacer click fuera
  useEffect(() => {
    if (!showInfoTooltip) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (infoRef.current && !infoRef.current.contains(e.target as Node)) {
        setShowInfoTooltip(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showInfoTooltip]);

  // Adjunta el listener global de teclado
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Mantiene enfocado el input oculto: es lo que le indica al navegador
  // móvil que debe mostrar el teclado virtual. Sin un elemento enfocable
  // no hay forma de invocarlo en celulares/tablets.
  useEffect(() => {
    hiddenInputRef.current?.focus({ preventScroll: true });
  }, [snippetIdx, mode, finished]);

  const focusHiddenInput = () => hiddenInputRef.current?.focus({ preventScroll: true });

  // Scroll del cursor a la vista
  useEffect(() => {
    displayRef.current
      ?.querySelector('[data-cursor="true"]')
      ?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [cursor]);

  const nextSnippet = () => { setSnippetIdx(i => (i + 1) % snippets.length); setShowInfoTooltip(false); };
  const prevSnippet = () => { setSnippetIdx(i => (i - 1 + snippets.length) % snippets.length); setShowInfoTooltip(false); };


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
                <span className="flex items-center gap-1">{m === 'speed' ? <><Timer className="w-3.5 h-3.5" /> Speed</> : <><BookOpen className="w-3.5 h-3.5" /> Learn</>}</span>
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
          {/* Selector de tamaño de fuente del editor */}
          <div className="flex gap-1 bg-muted rounded-lg p-1">
            {SIZE_OPTIONS.map(s => (
              <button key={s} onClick={() => setEditorSize(s)}
                className={`px-2 sm:px-3 py-1.5 rounded-md text-xs font-medium transition-all ${editorSize === s ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  }`}>
                {s}
              </button>
            ))}
          </div>
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
              {snippet.explanation && (
                <div className="relative ml-1" ref={infoRef}
                  onMouseEnter={() => setShowInfoTooltip(true)}
                  onMouseLeave={() => setShowInfoTooltip(false)}>
                  <button
                    type="button"
                    onClick={() => setShowInfoTooltip(v => !v)}
                    className="text-muted-foreground hover:text-foreground transition-colors flex items-center"
                    aria-label="Ver explicación del concepto"
                  >
                    <Info className="w-3.5 h-3.5" />
                  </button>
                  {showInfoTooltip && (
                    <div
                      className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-20 w-max max-w-xs px-3 py-2 rounded-lg text-xs leading-relaxed shadow-lg"
                      style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                    >
                      <div
                        className="absolute -top-[5px] left-1/2 -translate-x-1/2 w-2.5 h-2.5 rotate-45"
                        style={{ background: 'var(--card)', borderLeft: '1px solid var(--border)', borderTop: '1px solid var(--border)' }}
                      />
                      {snippet.explanation}
                    </div>
                  )}
                </div>
              )}
              <span className="text-xs text-muted-foreground font-mono ml-1 truncate">
                {snippet.concept}.{language.toLowerCase()}
              </span>
              <Button variant="ghost" size="sm" onClick={reset} className="ml-auto flex-shrink-0">
                <RotateCw className="w-3.5 h-3.5" />
              </Button>
            </div>
            {/* Input oculto: enfocarlo es lo único que abre el teclado virtual en móvil */}
            <input
              ref={hiddenInputRef}
              onChange={() => { }}
              value=""
              className="sr-only"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              inputMode="text"
              tabIndex={-1}
              aria-label="Área de escritura"
            />
            <div ref={displayRef}
              onClick={focusHiddenInput}
              onTouchStart={focusHiddenInput}
              className={`p-3 sm:p-6 font-mono whitespace-pre overflow-x-auto select-none transition-all cursor-text ${finished ? 'min-h-[340px] sm:min-h-[380px]' : 'min-h-[120px] sm:min-h-[160px]'
                }`}
              style={{ background: '#1a1714', fontSize: `${SIZE_PX[editorSize]}px`, lineHeight: `${Math.round(SIZE_PX[editorSize] * 1.8)}px` }}>
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
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 sm:gap-3 p-4 overflow-y-auto"
                style={{ background: 'rgba(26,23,20,0.95)' }}>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Resultado</p>
                <p className="text-4xl sm:text-5xl font-bold font-mono" style={{ color: accentColor }}>{wpm}</p>
                <div className="flex gap-4 sm:gap-6 text-xs sm:text-sm text-muted-foreground flex-wrap justify-center">
                  <span>{accuracy}% precisión</span>
                  <span>{errors} errores</span>
                  <span style={{ color: accentColor }}>WPM</span>
                </div>

                {snippet.output !== undefined && (
                  <div
                    className="w-full max-w-lg rounded-xl overflow-hidden text-left shadow-lg"
                    style={{ background: '#100e0c', border: `1px solid ${accentColor}30` }}
                  >
                    <div
                      className="flex items-center gap-1.5 px-3 py-1.5"
                      style={{ background: `${accentColor}14`, borderBottom: `1px solid ${accentColor}25` }}
                    >
                      <Terminal className="w-3 h-3" style={{ color: accentColor }} />
                      <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: accentColor }}>
                        Salida
                      </span>
                    </div>
                    <pre
                      className="text-[11px] sm:text-xs font-mono leading-relaxed px-3 py-2 whitespace-pre-wrap break-words max-h-16 overflow-y-auto m-0"
                      style={{ color: snippet.output.trim() === '' ? '#8a8578' : '#8fc78a', fontStyle: snippet.output.trim() === '' ? 'italic' : 'normal' }}
                    >
                      {snippet.output.trim() === ''
                        ? 'Sin salida — este código solo define funciones/clases.'
                        : snippet.output}
                    </pre>
                    {snippet.outputExplanation && (
                      <div
                        className="flex items-start gap-1.5 px-3 py-2"
                        style={{ background: 'rgba(255,255,255,0.03)', borderTop: '1px solid rgba(255,255,255,0.06)' }}
                      >
                        <Lightbulb className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: accentColor }} />
                        <p className="text-[10px] sm:text-[11px] leading-relaxed text-left text-muted-foreground">
                          {snippet.outputExplanation}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-2 mt-1 flex-wrap justify-center">
                  <Button onClick={reset} style={{ background: accentColor, color: '#fff', border: 'none' }} className="gap-1.5">
                    <RotateCw className="w-3.5 h-3.5" /> Reintentar
                  </Button>
                  <Button variant="outline" onClick={nextSnippet} className="gap-1.5">
                    Siguiente <ArrowRight className="w-3.5 h-3.5" />
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
              <Keyboard className="w-3.5 h-3.5" /> Cheatsheet
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
                <ClipboardList className="w-3.5 h-3.5" /> Info
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