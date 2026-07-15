'use client';
import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from './useAuth';

export interface KeyBinding {
    char: string;
    keys: string[];  // ej: ['Shift', '0']
}

const STORAGE_KEY = 'codetype_keyboard';
const CONFIGURED_KEY = 'codetype_keyboard_configured';

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

function loadLocal(): KeyBinding[] {
    if (typeof window === 'undefined') return [];
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]'); }
    catch { return []; }
}

// Dispositivo táctil sin puntero de precisión (celular/tablet) — no tiene
// teclado físico que mapear, así que el wizard de configuración no aplica.
function isTouchOnlyDevice(): boolean {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(pointer: coarse)').matches
        && window.matchMedia('(hover: none)').matches;
}

function loadConfiguredLocal(): boolean | null {
    if (typeof window === 'undefined') return null;
    const val = localStorage.getItem(CONFIGURED_KEY);
    if (val === null) {
        // Fallback: si hay bindings guardados, está configurado
        const bindings = loadLocal();
        if (bindings.length > 0) return true;
        // En móvil/tablet no hay teclado físico que configurar
        return isTouchOnlyDevice() ? true : null;
    }
    return val === 'true';
}

function saveLocal(bindings: KeyBinding[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bindings));
}

function saveConfiguredLocal(configured: boolean) {
    localStorage.setItem(CONFIGURED_KEY, JSON.stringify(configured));
}

export function useKeyboardConfig() {
    const { user } = useAuth();
    const [bindings, setBindings] = useState<KeyBinding[]>([]);
    const [configured, setConfigured] = useState<boolean | null>(null);

    // Carga bindings — de Supabase si hay usuario, si no de localStorage
    useEffect(() => {
        if (user) {
            const supabase = createClient();
            supabase
                .from('keyboard_config')
                .select('*')
                .eq('user_id', user.id)
                .single()
                .then(({ data }) => {
                    if (data) {
                        const b = (data.bindings as KeyBinding[]) ?? [];
                        setBindings(b);
                        setConfigured(data.configured);
                        // Caché local
                        saveLocal(b);
                        saveConfiguredLocal(data.configured);
                    } else {
                        // No tiene config en Supabase, checar localStorage
                        const localBindings = loadLocal();
                        const localConfigured = loadConfiguredLocal();
                        setBindings(localBindings);
                        setConfigured(localConfigured === null ? false : localConfigured);

                        // Si tiene datos locales, migrarlos a Supabase
                        if (localBindings.length > 0 && localConfigured) {
                            supabase.from('keyboard_config').upsert({
                                user_id: user.id,
                                bindings: localBindings,
                                configured: true,
                                updated_at: new Date().toISOString(),
                            }, { onConflict: 'user_id' });
                        }
                    }
                });
        } else {
            const localBindings = loadLocal();
            const localConfigured = loadConfiguredLocal();
            setBindings(localBindings);
            if (localConfigured === null) {
                // Nunca configurado
                setConfigured(localBindings.length > 0 ? true : false);
            } else {
                setConfigured(localConfigured);
            }
        }
    }, [user]);

    const saveBinding = useCallback((char: string, keys: string[]) => {
        setBindings(prev => {
            const filtered = prev.filter(b => b.char !== char);
            const updated = [...filtered, { char, keys }];
            saveLocal(updated);
            return updated;
        });
    }, []);

    const finishConfig = useCallback(() => {
        setConfigured(true);
        saveConfiguredLocal(true);

        // Persistir en Supabase
        if (user) {
            const currentBindings = loadLocal(); // leer el estado más reciente del localStorage
            const supabase = createClient();
            supabase.from('keyboard_config').upsert({
                user_id: user.id,
                bindings: currentBindings,
                configured: true,
                updated_at: new Date().toISOString(),
            }, { onConflict: 'user_id' });
        }
    }, [user]);

    const resetConfig = useCallback(() => {
        saveLocal([]);
        saveConfiguredLocal(false);
        setBindings([]);
        setConfigured(false);

        if (user) {
            const supabase = createClient();
            supabase.from('keyboard_config').upsert({
                user_id: user.id,
                bindings: [],
                configured: false,
                updated_at: new Date().toISOString(),
            }, { onConflict: 'user_id' });
        }
    }, [user]);

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