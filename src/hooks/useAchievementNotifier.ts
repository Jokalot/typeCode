'use client';

import { useEffect, useRef, useState } from 'react';
import { Achievement, ACHIEVEMENTS } from '@/data/achievements';
import { Session } from '@/hooks/useSession';
import { ConceptProgress } from '@/types';

const STORAGE_KEY = 'codetype_seen_achievements';

function getSeenIds(): Set<string> {
    if (typeof window === 'undefined') return new Set();
    try { return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')); }
    catch { return new Set(); }
}

function markSeen(id: string) {
    const seen = getSeenIds();
    seen.add(id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...seen]));
}

export function useAchievementNotifier(sessions: Session[], progress: ConceptProgress[]) {
    const [queue, setQueue] = useState<Achievement[]>([]);
    const initialized = useRef(false);

    useEffect(() => {
        if (sessions.length === 0 && progress.length === 0) return;

        const seen = getSeenIds();
        const newlyUnlocked: Achievement[] = [];

        for (const a of ACHIEVEMENTS) {
            if (!seen.has(a.id) && a.check(sessions, progress)) {
                newlyUnlocked.push(a);
                markSeen(a.id);
            }
        }

        if (!initialized.current) {
            // Primera carga — no notificar logros ya existentes
            initialized.current = true;
            return;
        }

        if (newlyUnlocked.length > 0) {
            setQueue(q => [...q, ...newlyUnlocked]);
        }
    }, [sessions, progress]);

    const dismiss = () => setQueue(q => q.slice(1));
    const current = queue[0] ?? null;

    return { current, dismiss };
}