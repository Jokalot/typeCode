import { useState, useEffect, useCallback } from 'react';

export interface Session {
    id: string;
    language: string;
    concept: string;
    wpm: number;
    accuracy: number;
    errors: number;
    mode: 'speed' | 'learn';
    playedAt: string; // ISO string
}

export interface UserStats {
    totalSessions: number;
    bestWpm: number;
    avgAccuracy: number;
    currentStreak: number; // días consecutivos
}

const STORAGE_KEY = 'codetype_sessions';

function loadSessions(): Session[] {
    if (typeof window === 'undefined') return [];
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    } catch {
        return [];
    }
}

function saveSessions(sessions: Session[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

function computeStreak(sessions: Session[]): number {
    if (sessions.length === 0) return 0;

    const days = [...new Set(
        sessions.map(s => s.playedAt.slice(0, 10)) // 'YYYY-MM-DD'
    )].sort().reverse();

    let streak = 1;
    for (let i = 0; i < days.length - 1; i++) {
        const curr = new Date(days[i]);
        const prev = new Date(days[i + 1]);
        const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
        if (diff === 1) streak++;
        else break;
    }

    // Si la última sesión no fue hoy ni ayer, racha rota
    const lastDay = new Date(days[0]);
    const today = new Date();
    const diffToday = (today.setHours(0, 0, 0, 0) - lastDay.setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24);
    if (diffToday > 1) return 0;

    return streak;
}

export function useSession() {
    const [sessions, setSessions] = useState<Session[]>([]);

    useEffect(() => {
        setSessions(loadSessions());
    }, []);

    const saveSession = useCallback((
        data: Omit<Session, 'id' | 'playedAt'>
    ) => {
        const newSession: Session = {
            ...data,
            id: crypto.randomUUID(),
            playedAt: new Date().toISOString(),
        };
        setSessions(prev => {
            const updated = [newSession, ...prev];
            saveSessions(updated);
            return updated;
        });
        return newSession;
    }, []);

    const clearSessions = useCallback(() => {
        saveSessions([]);
        setSessions([]);
    }, []);

    const stats: UserStats = {
        totalSessions: sessions.length,
        bestWpm: sessions.reduce((max, s) => Math.max(max, s.wpm), 0),
        avgAccuracy: sessions.length > 0
            ? Math.round(sessions.reduce((sum, s) => sum + s.accuracy, 0) / sessions.length)
            : 0,
        currentStreak: computeStreak(sessions),
    };

    const byLanguage = (lang: string) =>
        sessions.filter(s => s.language.toLowerCase() === lang.toLowerCase());

    return { sessions, stats, saveSession, clearSessions, byLanguage };
}