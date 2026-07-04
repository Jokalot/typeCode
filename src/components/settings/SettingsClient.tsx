'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, RotateCw, CheckCircle2, Keyboard, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useKeyboardConfig, KeyBinding } from '@/hooks/useKeyboardConfig';
import { KeyboardSetupModal } from '@/components/practice/KeyboardSetupModal';
import Link from 'next/link';

function Kbd({ children }: { children: string }) {
    return (
        <span
            className="inline-flex items-center justify-center px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold"
            style={{
                background: 'var(--muted)',
                border: '1px solid var(--border)',
                boxShadow: '0 2px 0 var(--border)',
                color: 'var(--foreground)',
                minWidth: '28px',
            }}
        >
            {children}
        </span>
    );
}

interface ReconfigureModalProps {
    char: string;
    label: string;
    onSave: (char: string, keys: string[]) => void;
    onClose: () => void;
}

function ReconfigureCharModal({ char, label, onSave, onClose }: ReconfigureModalProps) {
    const [status, setStatus] = useState<'waiting' | 'captured' | 'wrong'>('waiting');
    const [capturedKeys, setCapturedKeys] = useState<string[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (['Shift', 'Control', 'Alt', 'Meta', 'Tab', 'Escape'].includes(e.key)) return;

        const keys: string[] = [];
        if (e.shiftKey) keys.push('Shift');
        if (e.ctrlKey) keys.push('Ctrl');
        if (e.altKey) keys.push('Alt');
        if (e.metaKey) keys.push('Cmd');
        keys.push(e.key.length === 1 ? e.key.toUpperCase() : e.key);

        const produced = e.key;
        if (produced === char) {
            setCapturedKeys(keys);
            setStatus('captured');
        } else {
            setCapturedKeys(keys);
            setStatus('wrong');
        }

        e.preventDefault();
    }, [char]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
        >
            <div
                className="w-full max-w-sm mx-3 rounded-2xl p-6 flex flex-col gap-5"
                style={{
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    boxShadow: '0 24px 48px rgba(0,0,0,0.15)',
                }}
            >
                <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold" style={{ color: 'var(--foreground)' }}>
                        Reconfigurar: {label}
                    </h3>
                    <button onClick={onClose} className="p-1 rounded-lg hover:bg-[var(--muted)] transition-colors">
                        <X className="w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
                    </button>
                </div>

                <div className="flex flex-col items-center gap-4 py-2">
                    <div
                        className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl font-mono font-bold select-none"
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
                        {char}
                    </div>

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
                                    <span key={i} className="flex items-center gap-0.5">
                                        <Kbd>{k}</Kbd>
                                        {i < capturedKeys.length - 1 && (
                                            <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>+</span>
                                        )}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {status === 'wrong' && (
                        <div
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm"
                            style={{ background: 'rgba(232,154,154,0.12)', color: 'var(--destructive)' }}
                        >
                            <span>✗ Eso produjo <strong>{capturedKeys.join(' + ')}</strong>, intenta de nuevo.</span>
                        </div>
                    )}
                </div>

                <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={onClose} className="flex-1">
                        Cancelar
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => {
                            onSave(char, capturedKeys);
                            onClose();
                        }}
                        disabled={status !== 'captured'}
                        className="flex-1"
                        style={{
                            background: 'var(--primary)',
                            color: 'var(--primary-foreground)',
                            border: 'none',
                            opacity: status !== 'captured' ? 0.5 : 1,
                        }}
                    >
                        Guardar
                    </Button>
                </div>
            </div>
        </div>
    );
}

export function SettingsClient() {
    const { bindings, configured, charsToConfig, saveBinding, finishConfig, resetConfig } = useKeyboardConfig();
    const [showWizard, setShowWizard] = useState(false);
    const [reconfigChar, setReconfigChar] = useState<{ char: string; label: string } | null>(null);

    if (configured === null) return null;

    if (showWizard) {
        return (
            <KeyboardSetupModal
                onComplete={() => {
                    finishConfig();
                    setShowWizard(false);
                }}
            />
        );
    }

    const getBindingForChar = (char: string): KeyBinding | undefined =>
        bindings.find(b => b.char === char);

    return (
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-3xl">
            {/* Header */}
            <div className="mb-6 sm:mb-8 flex items-center gap-3">
                <Link href="/">
                    <Button variant="ghost" size="sm" className="gap-1">
                        <ChevronLeft className="w-4 h-4" />
                        Inicio
                    </Button>
                </Link>
            </div>

            <div className="mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl font-bold mb-1" style={{ color: 'var(--foreground)' }}>
                    Configuración
                </h2>
                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                    Administra las preferencias de tu cuenta.
                </p>
            </div>

            {/* Keyboard Section */}
            <div
                className="rounded-2xl p-5 sm:p-6 flex flex-col gap-5"
                style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
            >
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: 'rgba(168,144,128,0.12)' }}
                        >
                            <Keyboard className="w-5 h-5" style={{ color: 'var(--primary)' }} />
                        </div>
                        <div>
                            <h3 className="text-base font-bold" style={{ color: 'var(--foreground)' }}>
                                Teclado
                            </h3>
                            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                                {configured
                                    ? `${bindings.length} caracteres configurados`
                                    : 'Sin configurar — configura tu teclado para empezar'}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowWizard(true)}
                            className="gap-1.5"
                        >
                            <RotateCw className="w-3.5 h-3.5" />
                            {configured ? 'Reconfigurar todo' : 'Configurar'}
                        </Button>
                        {configured && bindings.length > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={resetConfig}
                                className="text-destructive hover:text-destructive"
                            >
                                Restablecer
                            </Button>
                        )}
                    </div>
                </div>

                {/* Bindings Table */}
                {bindings.length > 0 ? (
                    <div className="flex flex-col gap-0.5">
                        <div
                            className="grid grid-cols-[60px_1fr_auto] items-center gap-3 px-3 py-2 text-xs font-medium uppercase tracking-wider"
                            style={{ color: 'var(--muted-foreground)' }}
                        >
                            <span>Símbolo</span>
                            <span>Teclas</span>
                            <span></span>
                        </div>

                        {charsToConfig.map(({ char, label }) => {
                            const binding = getBindingForChar(char);
                            if (!binding) return null;
                            return (
                                <div
                                    key={char}
                                    className="grid grid-cols-[60px_1fr_auto] items-center gap-3 px-3 py-2.5 rounded-xl transition-colors hover:bg-[var(--muted)]"
                                >
                                    <span
                                        className="text-lg font-mono font-bold text-center"
                                        style={{ color: 'var(--foreground)' }}
                                    >
                                        {char}
                                    </span>
                                    <div className="flex items-center gap-1 flex-wrap">
                                        {binding.keys.map((k, i) => (
                                            <span key={i} className="flex items-center gap-0.5">
                                                <Kbd>{k}</Kbd>
                                                {i < binding.keys.length - 1 && (
                                                    <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>+</span>
                                                )}
                                            </span>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => setReconfigChar({ char, label })}
                                        className="text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors hover:bg-[var(--muted)]"
                                        style={{ color: 'var(--primary)' }}
                                    >
                                        Cambiar
                                    </button>
                                </div>
                            );
                        })}

                        {/* Show unconfigured chars */}
                        {charsToConfig.filter(c => !getBindingForChar(c.char)).length > 0 && (
                            <>
                                <div className="my-2" style={{ borderTop: '1px solid var(--border)' }} />
                                <p className="text-xs px-3 mb-1" style={{ color: 'var(--muted-foreground)' }}>
                                    Sin configurar
                                </p>
                                {charsToConfig.map(({ char, label }) => {
                                    if (getBindingForChar(char)) return null;
                                    return (
                                        <div
                                            key={char}
                                            className="grid grid-cols-[60px_1fr_auto] items-center gap-3 px-3 py-2.5 rounded-xl transition-colors hover:bg-[var(--muted)]"
                                            style={{ opacity: 0.5 }}
                                        >
                                            <span
                                                className="text-lg font-mono font-bold text-center"
                                                style={{ color: 'var(--muted-foreground)' }}
                                            >
                                                {char}
                                            </span>
                                            <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                                                {label}
                                            </span>
                                            <button
                                                onClick={() => setReconfigChar({ char, label })}
                                                className="text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors hover:bg-[var(--muted)]"
                                                style={{ color: 'var(--primary)' }}
                                            >
                                                Configurar
                                            </button>
                                        </div>
                                    );
                                })}
                            </>
                        )}
                    </div>
                ) : (
                    <div
                        className="flex flex-col items-center justify-center py-8 sm:py-12 rounded-xl"
                        style={{ background: 'var(--muted)' }}
                    >
                        <Keyboard className="w-10 h-10 mb-3" style={{ color: 'var(--muted-foreground)', opacity: 0.5 }} />
                        <p className="text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>
                            No hay configuración guardada
                        </p>
                        <p className="text-xs mb-4" style={{ color: 'var(--muted-foreground)' }}>
                            Configura tu teclado para ver las combinaciones de teclas durante los ejercicios.
                        </p>
                        <Button
                            size="sm"
                            onClick={() => setShowWizard(true)}
                            style={{
                                background: 'var(--primary)',
                                color: 'var(--primary-foreground)',
                                border: 'none',
                            }}
                        >
                            Configurar teclado
                        </Button>
                    </div>
                )}
            </div>

            {/* Reconfigure single char modal */}
            {reconfigChar && (
                <ReconfigureCharModal
                    char={reconfigChar.char}
                    label={reconfigChar.label}
                    onSave={(char, keys) => {
                        saveBinding(char, keys);
                        finishConfig();
                    }}
                    onClose={() => setReconfigChar(null)}
                />
            )}
        </div>
    );
}
