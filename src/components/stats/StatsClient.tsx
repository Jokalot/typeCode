'use client';

import { useRouter } from 'next/navigation';
import { useSession } from '@/hooks/useSession';
import { LanguageIcon } from '@/components/LanguageIcon';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Trash2, TrendingUp, Target, Zap, Award, Keyboard, ArrowRight } from 'lucide-react';

export function StatsClient() {
    const router = useRouter();
    const { sessions, stats, clearSessions, byLanguage } = useSession();

    // Últimas 20 sesiones para la gráfica de WPM
    const recent = sessions.slice(0, 20).reverse();
    const maxWpm = Math.max(...recent.map(s => s.wpm), 1);

    // Lenguajes practicados
    const langs = [...new Set(sessions.map(s => s.language))];

    return (
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-4xl">

            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-3">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" onClick={() => router.push('/')} className="gap-1">
                        <ChevronLeft className="w-4 h-4" />
                        Volver
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Mis estadísticas</h1>
                        <p className="text-sm text-muted-foreground">{stats.totalSessions} sesiones completadas</p>
                    </div>
                </div>
                {sessions.length > 0 && (
                    <Button variant="outline" size="sm" onClick={clearSessions} className="gap-2 text-destructive hover:text-destructive w-full sm:w-auto">
                        <Trash2 className="w-4 h-4" />
                        Limpiar historial
                    </Button>
                )}
            </div>

            {sessions.length === 0 ? (
                // Estado vacío
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                    <Keyboard className="w-12 h-12" style={{ color: 'var(--muted-foreground)', opacity: 0.5 }} />
                    <h2 className="text-xl font-semibold">Aún no hay sesiones</h2>
                    <p className="text-muted-foreground text-sm">Completa tu primera práctica para ver tus estadísticas aquí.</p>
                    <Button onClick={() => router.push('/')} className="mt-2">
                        Empezar a practicar
                    </Button>
                </div>
            ) : (
                <div className="flex flex-col gap-6">

                    {/* Cards de resumen */}
                    <div className="grid grid-cols-2 gap-2 sm:gap-4 md:grid-cols-4">
                        {[
                            { icon: TrendingUp, label: 'Mejor WPM', value: stats.bestWpm, color: 'var(--chart-1)', unit: 'wpm' },
                            { icon: Target, label: 'Precisión promedio', value: `${stats.avgAccuracy}%`, color: 'var(--chart-4)' },
                            { icon: Zap, label: 'Racha actual', value: `${stats.currentStreak}d`, color: 'var(--chart-5)' },
                            { icon: Award, label: 'Sesiones totales', value: stats.totalSessions, color: 'var(--chart-2)' },
                        ].map((s, i) => {
                            const Icon = s.icon;
                            return (
                                <div key={i} className="bg-card border border-border rounded-xl p-3 sm:p-5">
                                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                                        <p className="text-xs text-muted-foreground">{s.label}</p>
                                        <Icon className="w-4 h-4" style={{ color: s.color }} />
                                    </div>
                                    <p className="text-xl sm:text-3xl font-bold font-mono" style={{ color: s.color }}>{s.value}</p>
                                </div>
                            );
                        })}
                    </div>

                    {/* Gráfica WPM */}
                    {recent.length > 1 && (
                        <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
                            <h2 className="text-sm font-semibold mb-5">Progreso de WPM</h2>
                            <div className="flex items-end gap-1.5 h-32">
                                {recent.map((s, i) => {
                                    const pct = (s.wpm / maxWpm) * 100;
                                    return (
                                        <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                                            {/* Tooltip */}
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                                {s.wpm} WPM · {s.accuracy}%
                                            </div>
                                            <div
                                                className="w-full rounded-t-sm transition-all duration-300"
                                                style={{
                                                    height: `${Math.max(pct, 4)}%`,
                                                    background: `var(--chart-1)`,
                                                    opacity: 0.4 + (i / recent.length) * 0.6,
                                                }}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                                <span>Más antiguo</span>
                                <span>Más reciente</span>
                            </div>
                        </div>
                    )}

                    {/* Por lenguaje */}
                    {langs.length > 0 && (
                        <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
                            <h2 className="text-sm font-semibold mb-4">Por lenguaje</h2>
                            <div className="flex flex-col gap-3">
                                {langs.map(lang => {
                                    const langSessions = byLanguage(lang);
                                    const bestWpm = Math.max(...langSessions.map(s => s.wpm));
                                    const avgAcc = Math.round(langSessions.reduce((sum, s) => sum + s.accuracy, 0) / langSessions.length);
                                    return (
                                        <div key={lang} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 rounded-lg"
                                            style={{ background: 'var(--muted)' }}>
                                            <LanguageIcon name={lang.toLowerCase()} size={28} />
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-medium">{lang}</span>
                                                    <span className="text-xs text-muted-foreground">{langSessions.length} sesiones</span>
                                                </div>
                                                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                                                    <span className="text-xs text-muted-foreground">
                                                        Mejor: <span className="font-mono font-semibold text-foreground">{bestWpm} WPM</span>
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        Precisión: <span className="font-mono font-semibold text-foreground">{avgAcc}%</span>
                                                    </span>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="sm" className="w-full sm:w-auto mt-2 sm:mt-0"
                                                onClick={() => router.push(`/practice/${lang.toLowerCase()}`)}>
                                                Practicar <ArrowRight className="w-3.5 h-3.5 inline-block ml-0.5" />
                                            </Button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Historial reciente */}
                    <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
                        <h2 className="text-sm font-semibold mb-4">Historial reciente</h2>
                        <div className="flex flex-col gap-2">
                            {sessions.slice(0, 10).map(s => (
                                <div key={s.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 p-3 rounded-lg hover:bg-muted transition-colors">
                                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                                        <LanguageIcon name={s.language.toLowerCase()} size={22} />
                                        <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium">{s.language}</span>
                                            <span className="text-xs px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                                                {s.concept}
                                            </span>
                                            <span className="text-xs text-muted-foreground capitalize">{s.mode}</span>
                                        </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 sm:gap-4 text-sm font-mono flex-shrink-0 pl-7 sm:pl-0">
                                        <span className="font-bold" style={{ color: 'var(--chart-1)' }}>{s.wpm} WPM</span>
                                        <span className="text-muted-foreground">{s.accuracy}%</span>
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(s.playedAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
}