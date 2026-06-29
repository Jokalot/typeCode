'use client';

import { HeaderWrapper } from '@/components/HeaderWrapper';
import { AchievementToast } from '@/components/achievements/AchievementToast';
import { useAchievementNotifier } from '@/hooks/useAchievementNotifier';
import { useSession } from '@/hooks/useSession';
import { useProgress } from '@/hooks/useProgress';

function AchievementNotifier() {
    const { sessions } = useSession();
    const { progress } = useProgress();
    const { current, dismiss } = useAchievementNotifier(sessions, progress);

    if (!current) return null;
    return <AchievementToast achievement={current} onDismiss={dismiss} />;
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="bg-background">
            <HeaderWrapper />
            <main>{children}</main>
            <AchievementNotifier />
            <footer className="border-t border-border mt-8 py-6">
                <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
                    © 2026 CapiType — Aprende a programar al ritmo de tus dedos.
                </div>
            </footer>
        </div>
    );
}