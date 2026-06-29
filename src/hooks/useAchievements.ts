'use client';

import { useMemo } from 'react';
import { ACHIEVEMENTS, Achievement } from '@/data/achievements';
import { Session } from '@/hooks/useSession';
import { ConceptProgress } from '@/types';

export interface AchievementWithStatus extends Achievement {
    unlocked: boolean;
}

export function useAchievements(sessions: Session[], progress: ConceptProgress[]) {
    const achievements = useMemo(() => {
        return ACHIEVEMENTS.map(a => ({
            ...a,
            unlocked: a.check(sessions, progress),
        }));
    }, [sessions, progress]);

    const unlocked = achievements.filter(a => a.unlocked);
    const locked = achievements.filter(a => !a.unlocked);

    return { achievements, unlocked, locked };
}