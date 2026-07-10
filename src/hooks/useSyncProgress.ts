'use client';
import { useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from './useAuth';
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

export function useSyncProgress() {
  const { user } = useAuth();
  const syncedUserId = useRef<string | null>(null);

  useEffect(() => {
    if (!user || syncedUserId.current === user.id) return;
    syncedUserId.current = user.id;

    const syncProgress = async () => {
      const localProgress = loadLocal();
      if (localProgress.length === 0) return;

      try {
        const supabase = createClient();
        const { data: remoteData, error } = await supabase
          .from('concept_progress')
          .select('*')
          .eq('user_id', user.id);

        if (error) return;

        const remoteProgress: ConceptProgress[] = (remoteData ?? []).map(p => ({
          conceptId: p.concept_id,
          languageName: p.language_name,
          levelId: p.level_id as LevelId,
          completedExercises: p.completed_exercises ?? [],
          dominated: p.dominated,
          bestAccuracy: p.best_accuracy,
          bestWpm: p.best_wpm,
        }));

        const merged = localProgress.map(local => {
          const remote = remoteProgress.find(
            r => r.conceptId === local.conceptId && r.languageName === local.languageName
          );
          return remote ? mergeProgress(local, remote) : local;
        });

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

        const mergedKeys = new Set(merged.map(p => `${p.languageName}::${p.conceptId}`));
        const remoteOnly = remoteProgress.filter(
          r => !mergedKeys.has(`${r.languageName}::${r.conceptId}`)
        );

        saveLocal([...merged, ...remoteOnly]);
      } catch {
        // Falla silenciosamente
      }
    };

    syncProgress();
  }, [user]);
}
