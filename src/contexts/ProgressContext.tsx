'use client';
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ConceptProgress, LevelId } from '@/types';

const STORAGE_KEY = 'codetype_progress';

function loadLocal(): ConceptProgress[] {
    if (typeof window === 'undefined') return [];
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]'); }
    catch { return []; }
}

function saveLocal(data: ConceptProgress[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function mapRow(p: Record<string, unknown>): ConceptProgress {
    return {
        conceptId: p.concept_id as string,
        languageName: p.language_name as string,
        levelId: p.level_id as LevelId,
        completedExercises: (p.completed_exercises as number[]) ?? [],
        dominated: p.dominated as boolean,
        bestAccuracy: p.best_accuracy as number,
        bestWpm: p.best_wpm as number,
    };
}

function mergeProgress(local: ConceptProgress, remote: ConceptProgress): ConceptProgress {
    const completedExercises = [...new Set([...local.completedExercises, ...remote.completedExercises])];
    const bestAccuracy = Math.max(local.bestAccuracy, remote.bestAccuracy);
    const bestWpm = Math.max(local.bestWpm, remote.bestWpm);

    return {
        conceptId: local.conceptId,
        languageName: local.languageName,
        levelId: local.levelId,
        completedExercises,
        dominated: completedExercises.length === 3 && bestAccuracy >= 80,
        bestAccuracy,
        bestWpm,
    };
}

interface ProgressContextValue {
    progress: ConceptProgress[];
    completeExercise: (
        languageName: string,
        levelId: LevelId,
        conceptId: string,
        exerciseNumber: number,
        accuracy: number,
        wpm: number,
    ) => Promise<void>;
    getConceptProgress: (languageName: string, conceptId: string) => ConceptProgress | null;
    isUnlocked: (languageName: string, levelId: LevelId, conceptId: string, allConceptIds: string[]) => boolean;
    getLanguageStats: (languageName: string) => { dominated: number; started: number; totalExercises: number };
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [progress, setProgress] = useState<ConceptProgress[]>([]);

    useEffect(() => {
        if (!user) {
            setProgress(loadLocal());
            return;
        }

        let cancelled = false;

        (async () => {
            const supabase = createClient();
            const localProgress = loadLocal();

            try {
                const { data, error } = await supabase
                    .from('concept_progress')
                    .select('*')
                    .eq('user_id', user.id);

                if (error || cancelled) return;

                const remoteProgress = (data ?? []).map(mapRow);

                const merged = localProgress.map(local => {
                    const remote = remoteProgress.find(
                        r => r.conceptId === local.conceptId && r.languageName === local.languageName
                    );
                    return remote ? mergeProgress(local, remote) : local;
                });

                const mergedKeys = new Set(merged.map(p => `${p.languageName}::${p.conceptId}`));
                const remoteOnly = remoteProgress.filter(
                    r => !mergedKeys.has(`${r.languageName}::${r.conceptId}`)
                );
                const finalProgress = [...merged, ...remoteOnly];

                if (merged.length > 0) {
                    const rows = merged.map(p => ({
                        user_id: user.id,
                        language_name: p.languageName,
                        level_id: p.levelId,
                        concept_id: p.conceptId,
                        completed_exercises: p.completedExercises,
                        dominated: p.dominated,
                        best_accuracy: p.bestAccuracy,
                        best_wpm: p.bestWpm,
                        updated_at: new Date().toISOString(),
                    }));
                    await supabase
                        .from('concept_progress')
                        .upsert(rows, { onConflict: 'user_id,language_name,concept_id' });
                }

                if (!cancelled) {
                    setProgress(finalProgress);
                    saveLocal(finalProgress);
                }
            } catch {
                // Falla silenciosamente — se conserva lo que ya hay en local
            }
        })();

        return () => { cancelled = true; };
    }, [user]);

    const completeExercise = useCallback(async (
        languageName: string,
        levelId: LevelId,
        conceptId: string,
        exerciseNumber: number,
        accuracy: number,
        wpm: number,
    ) => {
        setProgress(prev => {
            const existing = prev.find(
                p => p.conceptId === conceptId && p.languageName === languageName
            );
            const completedExercises = [
                ...new Set([...(existing?.completedExercises ?? []), exerciseNumber])
            ];
            const bestAccuracy = Math.max(existing?.bestAccuracy ?? 0, accuracy);
            const bestWpm = Math.max(existing?.bestWpm ?? 0, wpm);
            const dominated = completedExercises.length === 3 && bestAccuracy >= 80;

            const updated: ConceptProgress = {
                conceptId,
                languageName,
                levelId,
                completedExercises,
                dominated,
                bestAccuracy,
                bestWpm,
            };

            const next = existing
                ? prev.map(p => p.conceptId === conceptId && p.languageName === languageName ? updated : p)
                : [...prev, updated];

            saveLocal(next);

            if (user) {
                const supabase = createClient();
                supabase.from('concept_progress').upsert({
                    user_id: user.id,
                    language_name: languageName,
                    level_id: levelId,
                    concept_id: conceptId,
                    completed_exercises: completedExercises,
                    dominated,
                    best_accuracy: bestAccuracy,
                    best_wpm: bestWpm,
                    updated_at: new Date().toISOString(),
                }, { onConflict: 'user_id,language_name,concept_id' });
            }

            return next;
        });
    }, [user]);

    const getConceptProgress = useCallback((languageName: string, conceptId: string) => {
        return progress.find(
            p => p.conceptId === conceptId && p.languageName === languageName
        ) ?? null;
    }, [progress]);

    const isUnlocked = useCallback((
        languageName: string,
        levelId: LevelId,
        conceptId: string,
        allConceptIds: string[],
    ): boolean => {
        const idx = allConceptIds.indexOf(conceptId);
        if (idx === 0) return true;
        const prevId = allConceptIds[idx - 1];
        const prevProgress = progress.find(
            p => p.conceptId === prevId && p.languageName === languageName
        );
        return (prevProgress?.completedExercises.length ?? 0) > 0;
    }, [progress]);

    const getLanguageStats = useCallback((languageName: string) => {
        const langProgress = progress.filter(p => p.languageName === languageName);
        return {
            dominated: langProgress.filter(p => p.dominated).length,
            started: langProgress.length,
            totalExercises: langProgress.reduce((sum, p) => sum + p.completedExercises.length, 0),
        };
    }, [progress]);

    return (
        <ProgressContext.Provider value={{ progress, completeExercise, getConceptProgress, isUnlocked, getLanguageStats }}>
            {children}
        </ProgressContext.Provider>
    );
}

export function useProgress() {
    const ctx = useContext(ProgressContext);
    if (!ctx) throw new Error('useProgress debe usarse dentro de ProgressProvider');
    return ctx;
}
