export type Difficulty = 'Principiante' | 'Intermedio' | 'Avanzado';
export type Mode = 'speed' | 'learn';
export type LevelId = 'fundamentos' | 'algoritmia' | 'buenas-practicas' | 'entrevista';

export interface Snippet {
  id: string;
  concept: string;       // agrupador — ej: "variables", "recursión"
  exerciseNumber: number; // 1, 2 o 3 dentro del concepto
  difficulty: Difficulty;
  code: string;
  explanation?: string;  // descripción corta del concepto (para Modo Learn)
  output?: string;       // salida esperada al ejecutar el código (precalculada)
}

export interface Concept {
  id: string;            // ej: "variables"
  label: string;         // ej: "Variables y tipos"
  snippets: Snippet[];   // siempre 3, de menor a mayor dificultad
}

export interface Level {
  id: LevelId;
  label: string;         // ej: "Fundamentos"
  description: string;
  icon: string;          // emoji o string de LanguageIcon
  concepts: Concept[];
}

export interface Language {
  name: string;
  icon: string;
  tag: string;
  description: string;
  difficulty: Difficulty;
  accentColor: string;
  levels: Level[];       // reemplaza snippets[] plano por niveles estructurados
}

// Progreso
export interface ConceptProgress {
  conceptId: string;
  languageName: string;
  levelId: LevelId;
  completedExercises: number[]; // [1, 2, 3] — ejercicios completados
  dominated: boolean;            // true cuando los 3 están hechos con accuracy >= 80
  bestAccuracy: number;
  bestWpm: number;
}

export interface TypingStats {
  wpm: number;
  accuracy: number;
  errors: number;
  progress: number;
  timeLeft: number;
}
