'use client';
import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from './useAuth';
import { ConceptProgress, LevelId } from '@/types';

const STORAGE_KEY = 'codetype_progress';

function load(): ConceptProgress[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]'); }
  catch { return []; }
}

function save(data: ConceptProgress[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function useProgress() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<ConceptProgress[]>([]);

  // Carga progreso
  useEffect(() => {
    if (user) {
      const supabase = createClient();
      supabase
        .from('concept_progress')
        .select('*')
        .eq('user_id', user.id)
        .then(({ data }) => {
          if (data) {
            const mapped: ConceptProgress[] = data.map(p => ({
              conceptId: p.concept_id,
              languageName: p.language_name,
              levelId: p.level_id as LevelId,
              completedExercises: p.completed_exercises ?? [],
              dominated: p.dominated,
              bestAccuracy: p.best_accuracy,
              bestWpm: p.best_wpm,
            }));
            setProgress(mapped);
            save(mapped);
          }
        });
    } else {
      setProgress(load());
    }
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

      save(next);

      // Guarda en Supabase si hay usuario
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

  return {
    progress,
    completeExercise,
    getConceptProgress,
    isUnlocked,
    getLanguageStats,
  };
}