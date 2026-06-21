'use client';

import { Snippet, Concept } from '@/types';
import { useProgress } from '@/hooks/useProgress';
import { CheckCircle2, Circle } from 'lucide-react';

interface Props {
    snippet: Snippet;
    concept: Concept;
    exerciseNumber: number;
    language: string;
    accentColor: string;
}

export function ExerciseInfoPanel({ snippet, concept, exerciseNumber, language, accentColor }: Props) {
    const { getConceptProgress } = useProgress();
    const cp = getConceptProgress(language, concept.id);

    return (
        <div
            className="w-full lg:w-64 lg:flex-shrink-0 rounded-2xl p-5 flex flex-col gap-4"
            style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
            }}
        >
            {/* Concepto */}
            <div>
                <span
                    className="text-[10px] font-bold tracking-widest uppercase px-2 py-1 rounded-md"
                    style={{ background: `${accentColor}15`, color: accentColor }}
                >
                    {concept.label}
                </span>
                <p className="text-xs font-semibold mt-2.5" style={{ color: 'var(--foreground)' }}>
                    {snippet.difficulty}
                </p>
            </div>

            {/* Explicación */}
            {snippet.explanation && (
                <>
                    <div style={{ borderTop: '1px solid var(--border)' }} />
                    <div>
                        <p className="text-[10px] font-bold mb-1.5" style={{ color: 'var(--foreground)' }}>
                            ¿Para qué sirve?
                        </p>
                        <p className="text-[11px] leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                            {snippet.explanation}
                        </p>
                    </div>
                </>
            )}

            {/* Progreso del concepto */}
            <div style={{ borderTop: '1px solid var(--border)' }} />
            <div>
                <p className="text-[10px] font-bold mb-2" style={{ color: 'var(--foreground)' }}>
                    Progreso del concepto
                </p>
                <div className="flex flex-col gap-1.5">
                    {[1, 2, 3].map(n => {
                        const done = cp?.completedExercises.includes(n) ?? false;
                        const isCurrent = n === exerciseNumber;
                        return (
                            <div
                                key={n}
                                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-colors"
                                style={{
                                    background: isCurrent
                                        ? `${accentColor}12`
                                        : 'transparent',
                                    border: `1px solid ${isCurrent ? accentColor + '30' : 'transparent'}`,
                                }}
                            >
                                {done ? (
                                    <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: accentColor }} />
                                ) : (
                                    <Circle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--border)' }} />
                                )}
                                <span
                                    className="text-[11px] font-medium"
                                    style={{ color: isCurrent ? accentColor : done ? 'var(--muted-foreground)' : 'var(--muted-foreground)' }}
                                >
                                    Ejercicio {n}
                                    {isCurrent && <span className="ml-1 text-[9px]">← actual</span>}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Stats del concepto si hay progreso */}
            {cp && cp.bestWpm > 0 && (
                <>
                    <div style={{ borderTop: '1px solid var(--border)' }} />
                    <div>
                        <p className="text-[10px] font-bold mb-2" style={{ color: 'var(--foreground)' }}>
                            Tus mejores marcas
                        </p>
                        <div className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>Mejor WPM</span>
                                <span className="text-xs font-mono font-bold" style={{ color: accentColor }}>
                                    {cp.bestWpm}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>Precisión</span>
                                <span className="text-xs font-mono font-bold" style={{ color: 'var(--foreground)' }}>
                                    {cp.bestAccuracy}%
                                </span>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Tip */}
            <div style={{ borderTop: '1px solid var(--border)' }} />
            <div
                className="rounded-xl p-3"
                style={{ background: `${accentColor}08`, border: `1px solid ${accentColor}20` }}
            >
                <p className="text-[10px] font-bold mb-1" style={{ color: accentColor }}>
                    💡 Tip
                </p>
                <p className="text-[10px] leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                    Lee el código completo antes de empezar a escribir. Anticipa los caracteres especiales.
                </p>
            </div>
        </div>
    );
}