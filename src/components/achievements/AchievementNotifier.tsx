'use client';

import { AchievementToast } from '@/components/achievements/AchievementToast';
import { useAchievementNotifier } from '@/hooks/useAchievementNotifier';
import { useSession } from '@/hooks/useSession';
import { useProgress } from '@/hooks/useProgress';

export function AchievementNotifier() {
    const { sessions } = useSession();
    const { progress } = useProgress();
    const { current, dismiss } = useAchievementNotifier(sessions, progress);

    if (!current) return null;
    return <AchievementToast achievement={current} onDismiss={dismiss} />;
}
