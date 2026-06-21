'use client';
import { useState, useEffect, useCallback } from 'react';

export interface KeyBinding {
    char: string;
    keys: string[];  // ej: ['Shift', '0']
}

const STORAGE_KEY = 'codetype_keyboard';

const CHARS_TO_CONFIG = [
    { char: '{', label: 'llave abre {' },
    { char: '}', label: 'llave cierra }' },
    { char: '[', label: 'corchete abre [' },
    { char: ']', label: 'corchete cierra ]' },
    { char: '(', label: 'paréntesis abre (' },
    { char: ')', label: 'paréntesis cierra )' },
    { char: '=', label: 'igual =' },
    { char: '+', label: 'más +' },
    { char: '-', label: 'guión -' },
    { char: '_', label: 'guión bajo _' },
    { char: '*', label: 'asterisco *' },
    { char: '/', label: 'diagonal /' },
    { char: '\\', label: 'backslash \\' },
    { char: '|', label: 'pipe |' },
    { char: '"', label: 'comilla doble "' },
    { char: "'", label: "comilla simple '" },
    { char: '`', label: 'backtick `' },
    { char: ':', label: 'dos puntos :' },
    { char: ';', label: 'punto y coma ;' },
    { char: '<', label: 'menor que <' },
    { char: '>', label: 'mayor que >' },
    { char: '!', label: 'exclamación !' },
    { char: '@', label: 'arroba @' },
    { char: '#', label: 'numeral #' },
    { char: '$', label: 'dólar $' },
    { char: '%', label: 'porciento %' },
    { char: '&', label: 'ampersand &' },
    { char: '~', label: 'tilde ~' },
    { char: '?', label: 'interrogación ?' },
];

function load(): KeyBinding[] {
    if (typeof window === 'undefined') return [];
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]'); }
    catch { return []; }
}

function save(bindings: KeyBinding[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bindings));
}

export function useKeyboardConfig() {
    const [bindings, setBindings] = useState<KeyBinding[]>([]);
    const [configured, setConfigured] = useState<boolean | null>(null);

    useEffect(() => {
        const saved = load();
        setBindings(saved);
        setConfigured(saved.length > 0);
    }, []);

    const saveBinding = useCallback((char: string, keys: string[]) => {
        setBindings(prev => {
            const filtered = prev.filter(b => b.char !== char);
            const updated = [...filtered, { char, keys }];
            save(updated);
            return updated;
        });
    }, []);

    const finishConfig = useCallback(() => {
        setConfigured(true);
    }, []);

    const resetConfig = useCallback(() => {
        save([]);
        setBindings([]);
        setConfigured(false);
    }, []);

    const getKeys = useCallback((char: string): string[] | null => {
        return bindings.find(b => b.char === char)?.keys ?? null;
    }, [bindings]);

    return {
        bindings,
        configured,
        charsToConfig: CHARS_TO_CONFIG,
        saveBinding,
        finishConfig,
        resetConfig,
        getKeys,
    };
}