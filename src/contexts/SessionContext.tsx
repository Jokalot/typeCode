'use client';
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface Session {
    id: string;
    language: string;
    concept: string;
    wpm: number;
    accuracy: number;
    errors: number;
    mode: 'speed' | 'learn';
    playedAt: string;
}

export interface UserStats {
    totalSessions: number;
    bestWpm: number;
    avgAccuracy: number;
    currentStreak: number;
}

const STORAGE_KEY = 'codetype_sessions';

function loadLocal(): Session[] {
    if (typeof window === 'undefined') return [];
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]'); }
    catch { return []; }
}

function saveLocal(sessions: Session[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

function computeStreak(sessions: Session[]): number {
    if (sessions.length === 0) return 0;
    const days = [...new Set(sessions.map(s => s.playedAt.slice(0, 10)))].sort().reverse();
    let streak = 1;
    for (let i = 0; i < days.length - 1; i++) {
        const curr = new Date(days[i]);
        const prev = new Date(days[i + 1]);
        const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
        if (diff === 1) streak++;
        else break;
    }
    const lastDay = new Date(days[0]);
    const today = new Date();
    const diffToday = (today.setHours(0, 0, 0, 0) - lastDay.setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24);
    if (diffToday > 1) return 0;
    return streak;
}

function computeStats(sessions: Session[]): UserStats {
    return {
        totalSessions: sessions.length,
        bestWpm: sessions.reduce((max, s) => Math.max(max, s.wpm), 0),
        avgAccuracy: sessions.length > 0
            ? Math.round(sessions.reduce((sum, s) => sum + s.accuracy, 0) / sessions.length)
            : 0,
        currentStreak: computeStreak(sessions),
    };
}

interface SessionContextValue {
    sessions: Session[];
    stats: UserStats;
    saveSession: (data: Omit<Session, 'id' | 'playedAt'>) => Promise<Session>;
    clearSessions: () => Promise<void>;
    byLanguage: (lang: string) => Session[];
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [sessions, setSessions] = useState<Session[]>([]);

    useEffect(() => {
        if (user) {
            const supabase = createClient();
            supabase
                .from('sessions')
                .select('*')
                .eq('user_id', user.id)
                .order('played_at', { ascending: false })
                .then(({ data }) => {
                    if (data) {
                        const mapped: Session[] = data.map(s => ({
                            id: s.id,
                            language: s.language,
                            concept: s.concept,
                            wpm: s.wpm,
                            accuracy: s.accuracy,
                            errors: s.errors,
                            mode: s.mode,
                            playedAt: s.played_at,
                        }));
                        setSessions(mapped);
                        saveLocal(mapped);
                    }
                });
        } else {
            setSessions(loadLocal());
        }
    }, [user]);

    const saveSession = useCallback(async (
        data: Omit<Session, 'id' | 'playedAt'>
    ) => {
        const newSession: Session = {
            ...data,
            id: crypto.randomUUID(),
            playedAt: new Date().toISOString(),
        };

        setSessions(prev => {
            const updated = [newSession, ...prev];
            saveLocal(updated);
            return updated;
        });

        if (user) {
            const supabase = createClient();
            await supabase.from('sessions').insert({
                user_id: user.id,
                language: data.language,
                concept: data.concept,
                wpm: data.wpm,
                accuracy: data.accuracy,
                errors: data.errors,
                mode: data.mode,
            });
        }

        return newSession;
    }, [user]);

    const clearSessions = useCallback(async () => {
        saveLocal([]);
        setSessions([]);
        if (user) {
            const supabase = createClient();
            await supabase.from('sessions').delete().eq('user_id', user.id);
        }
    }, [user]);

    const byLanguage = useCallback((lang: string) =>
        sessions.filter(s => s.language.toLowerCase() === lang.toLowerCase()), [sessions]);

    return (
        <SessionContext.Provider value={{ sessions, stats: computeStats(sessions), saveSession, clearSessions, byLanguage }}>
            {children}
        </SessionContext.Provider>
    );
}

export function useSession() {
    const ctx = useContext(SessionContext);
    if (!ctx) throw new Error('useSession debe usarse dentro de SessionProvider');
    return ctx;
}
