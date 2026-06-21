'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { CheckCircle2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useKeyboardConfig } from '@/hooks/useKeyboardConfig';

interface Props {
    onComplete: () => void;
}

export function KeyboardSetupModal({ onComplete }: Props) {
    const { charsToConfig, bindings, saveBinding, finishConfig } = useKeyboardConfig();
    const [currentIdx, setCurrentIdx] = useState(0);
    const [status, setStatus] = useState<'waiting' | 'captured' | 'wrong'>('waiting');
    const [capturedKeys, setCapturedKeys] = useState<string[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    const current = charsToConfig[currentIdx];
    const isLast = currentIdx === charsToConfig.length - 1;
    const alreadyBound = bindings.find(b => b.char === current.char);

    // Focus el input oculto siempre
    useEffect(() => {
        inputRef.current?.focus();
        setStatus('waiting');
        setCapturedKeys([]);
    }, [currentIdx]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (['Shift', 'Control', 'Alt', 'Meta', 'Tab', 'Escape'].includes(e.key)) return;

        const keys: string[] = [];
        if (e.shiftKey) keys.push('Shift');
        if (e.ctrlKey) keys.push('Ctrl');
        if (e.altKey) keys.push('Alt');
        if (e.metaKey) keys.push('Cmd');
        keys.push(e.key.length === 1 ? e.key.toUpperCase() : e.key);

        // Verifica si el carácter producido coincide con el esperado
        const produced = e.key;
        if (produced === current.char) {
            setCapturedKeys(keys);
            saveBinding(current.char, keys);
            setStatus('captured');
        } else {
            setCapturedKeys(keys);
            setStatus('wrong');
        }

        e.preventDefault();
    }, [current.char, saveBinding]);

    function next() {
        if (isLast) {
            finishConfig();
            onComplete();
        } else {
            setCurrentIdx(i => i + 1);
        }
    }

    function skip() {
        if (isLast) {
            finishConfig();
            onComplete();
        } else {
            setCurrentIdx(i => i + 1);
        }
    }

    const progress = (currentIdx / charsToConfig.length) * 100;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
        >
            <div
                className="w-full max-w-md rounded-2xl p-8 flex flex-col gap-6"
                style={{
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    boxShadow: '0 24px 48px rgba(0,0,0,0.15)',
                }}
            >
                {/* Header */}
                <div>
                    <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--foreground)' }}>
                        Configura tu teclado
                    </h2>
                    <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                        Escribe cada símbolo en tu teclado tal como lo harías normalmente. La app detectará las teclas automáticamente.
                    </p>
                </div>

                {/* Progreso */}
                <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 rounded-full" style={{ background: 'var(--muted)' }}>
                        <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{ width: `${progress}%`, background: 'var(--primary)' }}
                        />
                    </div>
                    <span className="text-xs font-mono flex-shrink-0" style={{ color: 'var(--muted-foreground)' }}>
                        {currentIdx + 1} / {charsToConfig.length}
                    </span>
                </div>

                {/* Carácter objetivo */}
                <div className="flex flex-col items-center gap-4 py-2">
                    <p className="text-xs uppercase tracking-widest" style={{ color: 'var(--muted-foreground)' }}>
                        Escribe este símbolo
                    </p>

                    {/* Carácter grande */}
                    <div
                        className="w-28 h-28 rounded-2xl flex items-center justify-center text-6xl font-mono font-bold select-none"
                        style={{
                            background: status === 'captured'
                                ? 'rgba(168,144,128,0.12)'
                                : status === 'wrong'
                                    ? 'rgba(232,154,154,0.12)'
                                    : 'var(--muted)',
                            border: `2px solid ${status === 'captured'
                                    ? 'var(--primary)'
                                    : status === 'wrong'
                                        ? 'var(--destructive)'
                                        : 'var(--border)'
                                }`,
                            color: 'var(--foreground)',
                            transition: 'all 0.15s',
                        }}
                    >
                        {current.char}
                    </div>

                    <p className="text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>
                        {current.label}
                    </p>

                    {/* Input oculto que captura las teclas */}
                    <input
                        ref={inputRef}
                        onKeyDown={handleKeyDown}
                        onChange={() => { }}
                        value=""
                        className="sr-only"
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck={false}
                    />

                    {/* Feedback */}
                    {status === 'waiting' && (
                        <div
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm"
                            style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}
                        >
                            <span className="animate-pulse">⌨️</span>
                            <span>Presiona la tecla en tu teclado...</span>
                        </div>
                    )}

                    {status === 'captured' && (
                        <div className="flex flex-col items-center gap-2">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                                <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                                    ¡Detectado!
                                </span>
                            </div>
                            <div className="flex items-center gap-1">
                                {capturedKeys.map((k, i) => (
                                    <span key={i} className="flex items-center gap-1">
                                        <kbd
                                            className="px-2.5 py-1.5 rounded-lg text-sm font-mono font-bold"
                                            style={{
                                                background: 'var(--muted)',
                                                border: '1px solid var(--border)',
                                                boxShadow: '0 2px 0 var(--border)',
                                                color: 'var(--foreground)',
                                            }}
                                        >
                                            {k}
                                        </kbd>
                                        {i < capturedKeys.length - 1 && (
                                            <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>+</span>
                                        )}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {status === 'wrong' && (
                        <div className="flex flex-col items-center gap-2">
                            <div
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm"
                                style={{ background: 'rgba(232,154,154,0.12)', color: 'var(--destructive)' }}
                            >
                                <span>✗</span>
                                <span>
                                    Eso produjo <strong>{capturedKeys.join(' + ')}</strong>, no <strong>{current.char}</strong>.
                                    Intenta de nuevo.
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Acciones */}
                <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={skip} className="flex-1">
                        Saltar
                    </Button>
                    <Button
                        size="sm"
                        onClick={next}
                        disabled={status !== 'captured' && !alreadyBound}
                        className="flex-1"
                        style={{
                            background: 'var(--primary)',
                            color: 'var(--primary-foreground)',
                            border: 'none',
                            opacity: status !== 'captured' && !alreadyBound ? 0.5 : 1,
                        }}
                    >
                        {isLast ? 'Finalizar ✓' : 'Siguiente'}
                        {!isLast && <ChevronRight className="w-4 h-4 ml-1" />}
                    </Button>
                </div>

                <p className="text-center text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    Puedes saltar lo que no uses. Se puede reconfigurar desde el Cheatsheet.
                </p>
            </div>
        </div>
    );
}