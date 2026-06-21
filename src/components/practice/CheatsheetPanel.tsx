'use client';

import { useMemo } from 'react';
import { useKeyboardConfig } from '@/hooks/useKeyboardConfig';

interface Props {
    code: string;
    accentColor: string;
}

const KEY_MAP: Record<string, { keys: string[]; label: string }> = {
    '{': { keys: ['Shift', '['], label: 'llave {' },
    '}': { keys: ['Shift', ']'], label: 'llave }' },
    '(': { keys: ['Shift', '9'], label: 'paréntesis (' },
    ')': { keys: ['Shift', '0'], label: 'paréntesis )' },
    '[': { keys: ['['], label: 'corchete [' },
    ']': { keys: [']'], label: 'corchete ]' },
    ':': { keys: ['Shift', ';'], label: 'dos puntos :' },
    ';': { keys: [';'], label: 'punto y coma ;' },
    '"': { keys: ['Shift', "'"], label: 'comilla "' },
    "'": { keys: ["'"], label: "comilla '" },
    '`': { keys: ['`'], label: 'backtick `' },
    '=': { keys: ['Shift', '0'], label: 'igual =' },
    '+': { keys: ['Shift', '='], label: 'más +' },
    '-': { keys: ['-'], label: 'guión -' },
    '_': { keys: ['Shift', '-'], label: 'guión bajo _' },
    '*': { keys: ['Shift', '8'], label: 'asterisco *' },
    '/': { keys: ['/'], label: 'diagonal /' },
    '\\': { keys: ['\\'], label: 'backslash \\' },
    '|': { keys: ['Shift', '\\'], label: 'pipe |' },
    '<': { keys: ['Shift', ','], label: 'menor que <' },
    '>': { keys: ['Shift', '.'], label: 'mayor que >' },
    '!': { keys: ['Shift', '1'], label: 'exclamación !' },
    '@': { keys: ['Shift', '2'], label: 'arroba @' },
    '#': { keys: ['Shift', '3'], label: 'numeral #' },
    '$': { keys: ['Shift', '4'], label: 'dólar $' },
    '%': { keys: ['Shift', '5'], label: 'porciento %' },
    '^': { keys: ['Shift', '6'], label: 'acento ^' },
    '&': { keys: ['Shift', '7'], label: 'ampersand &' },
    '~': { keys: ['Shift', '`'], label: 'tilde ~' },
    '?': { keys: ['Shift', '/'], label: 'interrogación ?' },
};

function Kbd({ children }: { children: string }) {
    return (
        <span
            className="inline-flex items-center justify-center px-2 py-1 rounded text-xs font-mono font-bold"
            style={{
                background: 'var(--muted)',
                border: '1px solid var(--border)',
                color: 'var(--foreground)',
                minWidth: '26px',
                boxShadow: '0 1px 0 var(--border)',
            }}
        >
            {children}
        </span>
    );
}

export function CheatsheetPanel({ code, accentColor }: Props) {
    const { getKeys } = useKeyboardConfig();

    const specialChars = useMemo(() => {
        const found = new Set<string>();
        for (const ch of code) {
            if (KEY_MAP[ch]) found.add(ch);
        }
        return Array.from(found);
    }, [code]);

    const sequences = useMemo(() => {
        const detected: { label: string; keys: string[] }[] = [];
        if (code.includes('=>')) detected.push({ label: 'arrow =>', keys: ['=', 'Shift', '.'] });
        if (code.includes('**')) detected.push({ label: 'potencia **', keys: ['Shift', '8', 'Shift', '8'] });
        if (code.includes('//')) detected.push({ label: 'comentario //', keys: ['/', '/'] });
        if (code.includes('!=')) detected.push({ label: 'distinto !=', keys: ['Shift', '1', '='] });
        if (code.includes('==')) detected.push({ label: 'igual ==', keys: ['=', '='] });
        if (code.includes('<=')) detected.push({ label: 'menor igual <=', keys: ['Shift', ',', '='] });
        if (code.includes('>=')) detected.push({ label: 'mayor igual >=', keys: ['Shift', '.', '='] });
        return detected;
    }, [code]);

    function renderKeys(char: string, fallbackKeys: string[]) {
        const userKeys = getKeys(char);
        const keys = userKeys ?? fallbackKeys;
        return (
            <div className="flex items-center gap-1 flex-wrap">
                {keys.map((k, i) => (
                    <span key={i} className="flex items-center gap-0.5">
                        <Kbd>{k}</Kbd>
                        {i < keys.length - 1 && (
                            <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>+</span>
                        )}
                    </span>
                ))}
                {userKeys && (
                    <span className="text-[10px] ml-1" style={{ color: accentColor }}>✓</span>
                )}
            </div>
        );
    }

    return (
        <div
            className="w-full lg:w-64 flex-shrink-0 rounded-2xl p-4 sm:p-5 flex flex-col gap-4"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
            {/* Header */}
            <div>
                <div className="flex items-center gap-1.5 mb-0.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="2.5" strokeLinecap="round">
                        <rect x="2" y="4" width="20" height="16" rx="2" />
                        <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M8 12h.01M12 12h.01M16 12h.01M7 16h10" />
                    </svg>
                    <span className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>Cheatsheet</span>
                </div>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    Caracteres en este snippet
                </p>
            </div>

            {/* Caracteres especiales */}
            {specialChars.length > 0 ? (
                <div className="flex flex-col gap-3">
                    {specialChars.map(ch => {
                        const info = KEY_MAP[ch];
                        return (
                            <div key={ch} className="flex flex-col gap-1">
                                <span className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>
                                    {info.label}
                                </span>
                                {renderKeys(ch, info.keys)}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    No hay caracteres especiales en este snippet.
                </p>
            )}

            {/* Secuencias */}
            {sequences.length > 0 && (
                <>
                    <div style={{ borderTop: '1px solid var(--border)' }} />
                    <div>
                        <p className="text-xs font-bold mb-2" style={{ color: 'var(--foreground)' }}>
                            Secuencias
                        </p>
                        <div className="flex flex-col gap-3">
                            {sequences.map((seq, i) => (
                                <div key={i} className="flex flex-col gap-1">
                                    <span className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>
                                        {seq.label}
                                    </span>
                                    <div className="flex items-center gap-1 flex-wrap">
                                        {seq.keys.map((k, j) => (
                                            <span key={j} className="flex items-center gap-0.5">
                                                <Kbd>{k}</Kbd>
                                                {j < seq.keys.length - 1 && (
                                                    <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>+</span>
                                                )}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {/* Atajos */}
            <div style={{ borderTop: '1px solid var(--border)' }} />
            <div className="flex flex-col gap-2">
                <p className="text-xs font-bold" style={{ color: 'var(--foreground)' }}>Atajos</p>
                {[
                    { keys: ['Tab'], label: 'Reiniciar' },
                    { keys: ['Esc'], label: 'Volver' },
                    { keys: ['↵'], label: 'Nueva línea' },
                ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between gap-2">
                        <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{item.label}</span>
                        <Kbd>{item.keys[0]}</Kbd>
                    </div>
                ))}
            </div>

            {/* Link a reconfigurar */}
            <div style={{ borderTop: '1px solid var(--border)' }} />
            <button
                className="text-xs text-left transition-colors hover:underline"
                style={{ color: accentColor }}
                onClick={() => {
                    localStorage.removeItem('codetype_keyboard');
                    window.location.reload();
                }}
            >
                ⚙️ Reconfigurar teclado
            </button>
        </div>
    );
}