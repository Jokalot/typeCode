'use client';

import { useSession } from '@/hooks/useSession';
import { useProgress } from '@/hooks/useProgress';
import { useAchievements } from '@/hooks/useAchievements';
import { AchievementIcon } from '@/components/icons/AchievementIcon';
import { Lock, Check } from 'lucide-react';

const categoryLabel = {
    velocidad: ' Velocidad',
    precision: ' Precisión',
    constancia: ' Constancia',
    progreso: ' Progreso',
};

export function AchievementsPanel() {
    const { sessions } = useSession();
    const { progress } = useProgress();
    const { achievements, unlocked } = useAchievements(sessions, progress);

    const byCategory = achievements.reduce((acc, a) => {
        if (!acc[a.category]) acc[a.category] = [];
        acc[a.category].push(a);
        return acc;
    }, {} as Record<string, typeof achievements>);

    return (
        <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>Logros</h1>
                    <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                        {unlocked.length} de {achievements.length} desbloqueados
                    </p>
                </div>
                {/* Barra de progreso total */}
                <div className="text-right">
                    <div className="text-2xl font-bold font-mono" style={{ color: 'var(--primary)' }}>
                        {Math.round((unlocked.length / achievements.length) * 100)}%
                    </div>
                    <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>completado</div>
                </div>
            </div>

            {/* Progreso global */}
            <div className="h-2 rounded-full mb-8" style={{ background: 'var(--muted)' }}>
                <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                        width: `${(unlocked.length / achievements.length) * 100}%`,
                        background: 'var(--primary)',
                    }}
                />
            </div>

            {/* Por categoría */}
            {(Object.keys(categoryLabel) as Array<keyof typeof categoryLabel>).map(cat => {
                const items = byCategory[cat] ?? [];
                const unlockedInCat = items.filter(a => a.unlocked).length;

                return (
                    <div key={cat} className="mb-8">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-sm font-bold uppercase tracking-widest"
                                style={{ color: 'var(--muted-foreground)' }}>
                                {categoryLabel[cat]}
                            </h2>
                            <span className="text-xs font-mono" style={{ color: 'var(--muted-foreground)' }}>
                                {unlockedInCat}/{items.length}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {items.map(a => (
                                <div
                                    key={a.id}
                                    className="flex items-center gap-4 rounded-xl p-4 transition-all"
                                    style={{
                                        background: a.unlocked ? 'var(--card)' : 'var(--muted)',
                                        border: `1px solid ${a.unlocked ? 'var(--primary)' : 'var(--border)'}`,
                                        opacity: a.unlocked ? 1 : 0.5,
                                    }}
                                >
                                    {/* Icono */}
                                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                                        style={{
                                            background: a.unlocked ? 'rgba(168,144,128,0.12)' : 'var(--muted)',
                                            border: `1px solid ${a.unlocked ? 'var(--primary)' : 'var(--border)'}`,
                                        }}>
                                        {a.unlocked
                                            ? <AchievementIcon id={a.id} size={24} color="var(--primary)" unlocked />
                                            : <Lock className="w-5 h-5" style={{ color: 'var(--muted-foreground)' }} />
                                        }
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                                                {a.title}
                                            </span>
                                            {a.unlocked && (
                                                <span className="text-xs px-1.5 py-0.5 rounded-full font-bold"
                                                    style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}>
                                                    <Check className="w-3 h-3" />
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                                            {a.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}