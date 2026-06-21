'use client';
import { useState, useEffect, useCallback } from 'react';
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
  const [progress, setProgress] = useState<ConceptProgress[]>([]);

  useEffect(() => { setProgress(load()); }, []);

  // Registra un ejercicio completado
  const completeExercise = useCallback((
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
      const updated: ConceptProgress = existing
        ? {
            ...existing,
            completedExercises: [...new Set([...existing.completedExercises, exerciseNumber])],
            bestAccuracy: Math.max(existing.bestAccuracy, accuracy),
            bestWpm: Math.max(existing.bestWpm, wpm),
            dominated: [...new Set([...existing.completedExercises, exerciseNumber])].length === 3
              && Math.max(existing.bestAccuracy, accuracy) >= 80,
          }
        : {
            conceptId,
            languageName,
            levelId,
            completedExercises: [exerciseNumber],
            dominated: false,
            bestAccuracy: accuracy,
            bestWpm: wpm,
          };

      const next = existing
        ? prev.map(p => p.conceptId === conceptId && p.languageName === languageName ? updated : p)
        : [...prev, updated];

      save(next);
      return next;
    });
  }, []);

  // Obtiene progreso de un concepto específico
  const getConceptProgress = useCallback((languageName: string, conceptId: string) => {
    return progress.find(
      p => p.conceptId === conceptId && p.languageName === languageName
    ) ?? null;
  }, [progress]);

  // Verifica si un concepto está desbloqueado
  // Regla: el primer concepto de cada nivel siempre está desbloqueado.
  // Los siguientes se desbloquean cuando el anterior tiene al menos 1 ejercicio completado.
  const isUnlocked = useCallback((
    languageName: string,
    levelId: LevelId,
    conceptId: string,
    allConceptIds: string[], // todos los conceptos del nivel en orden
  ): boolean => {
    const idx = allConceptIds.indexOf(conceptId);
    if (idx === 0) return true;
    const prevId = allConceptIds[idx - 1];
    const prevProgress = progress.find(
      p => p.conceptId === prevId && p.languageName === languageName
    );
    return (prevProgress?.completedExercises.length ?? 0) > 0;
  }, [progress]);

  // Stats generales por lenguaje
  const getLanguageStats = useCallback((languageName: string) => {
    const langProgress = progress.filter(p => p.languageName === languageName);
    return {
      dominated: langProgress.filter(p => p.dominated).length,
      started: langProgress.length,
      totalExercises: langProgress.reduce((sum, p) => sum + p.completedExercises.length, 0),
    };
  }, [progress]);

  return { progress, completeExercise, getConceptProgress, isUnlocked, getLanguageStats };
}
