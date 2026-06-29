import { Session } from '@/hooks/useSession';
import { ConceptProgress } from '@/types';

export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    category: 'velocidad' | 'precision' | 'constancia' | 'progreso';
    check: (sessions: Session[], progress: ConceptProgress[]) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
    // ── VELOCIDAD ──
    {
        id: 'first-type',
        title: 'Primera tecla',
        description: 'Completa tu primera sesión de práctica.',
        icon: '⌨️',
        category: 'velocidad',
        check: (sessions) => sessions.length >= 1,
    },
    {
        id: 'wpm-30',
        title: 'Dedos calientes',
        description: 'Alcanza 30 WPM en una sesión.',
        icon: '🔥',
        category: 'velocidad',
        check: (sessions) => sessions.some(s => s.wpm >= 30),
    },
    {
        id: 'wpm-50',
        title: 'Mecanógrafo',
        description: 'Alcanza 50 WPM en una sesión.',
        icon: '🚀',
        category: 'velocidad',
        check: (sessions) => sessions.some(s => s.wpm >= 50),
    },
    {
        id: 'wpm-80',
        title: 'Velocista',
        description: 'Alcanza 80 WPM en una sesión.',
        icon: '⚡',
        category: 'velocidad',
        check: (sessions) => sessions.some(s => s.wpm >= 80),
    },
    {
        id: 'wpm-100',
        title: 'Cien por hora',
        description: 'Alcanza 100 WPM en una sesión.',
        icon: '🌪️',
        category: 'velocidad',
        check: (sessions) => sessions.some(s => s.wpm >= 100),
    },

    // ── PRECISIÓN ──
    {
        id: 'accuracy-90',
        title: 'Buen puntería',
        description: 'Completa una sesión con 90% de precisión.',
        icon: '🎯',
        category: 'precision',
        check: (sessions) => sessions.some(s => s.accuracy >= 90),
    },
    {
        id: 'accuracy-95',
        title: 'Francotirador',
        description: 'Completa una sesión con 95% de precisión.',
        icon: '🏹',
        category: 'precision',
        check: (sessions) => sessions.some(s => s.accuracy >= 95),
    },
    {
        id: 'accuracy-100',
        title: 'Perfección',
        description: 'Completa una sesión sin ningún error.',
        icon: '💎',
        category: 'precision',
        check: (sessions) => sessions.some(s => s.accuracy === 100),
    },
    {
        id: 'no-errors',
        title: 'Manos limpias',
        description: 'Completa 5 sesiones con menos de 3 errores.',
        icon: '🧤',
        category: 'precision',
        check: (sessions) => sessions.filter(s => s.errors < 3).length >= 5,
    },

    // ── CONSTANCIA ──
    {
        id: 'sessions-10',
        title: 'En racha',
        description: 'Completa 10 sesiones en total.',
        icon: '📈',
        category: 'constancia',
        check: (sessions) => sessions.length >= 10,
    },
    {
        id: 'sessions-50',
        title: 'Dedicación',
        description: 'Completa 50 sesiones en total.',
        icon: '🏅',
        category: 'constancia',
        check: (sessions) => sessions.length >= 50,
    },
    {
        id: 'sessions-100',
        title: 'Centurión',
        description: 'Completa 100 sesiones en total.',
        icon: '🏆',
        category: 'constancia',
        check: (sessions) => sessions.length >= 100,
    },
    {
        id: 'streak-3',
        title: '3 días seguidos',
        description: 'Practica 3 días consecutivos.',
        icon: '🔥',
        category: 'constancia',
        check: (sessions) => {
            const days = [...new Set(sessions.map(s => s.playedAt.slice(0, 10)))].sort().reverse();
            if (days.length < 3) return false;
            for (let i = 0; i < 2; i++) {
                const diff = (new Date(days[i]).getTime() - new Date(days[i + 1]).getTime()) / 86400000;
                if (diff !== 1) return false;
            }
            return true;
        },
    },
    {
        id: 'streak-7',
        title: 'Semana completa',
        description: 'Practica 7 días consecutivos.',
        icon: '📅',
        category: 'constancia',
        check: (sessions) => {
            const days = [...new Set(sessions.map(s => s.playedAt.slice(0, 10)))].sort().reverse();
            if (days.length < 7) return false;
            for (let i = 0; i < 6; i++) {
                const diff = (new Date(days[i]).getTime() - new Date(days[i + 1]).getTime()) / 86400000;
                if (diff !== 1) return false;
            }
            return true;
        },
    },

    // ── PROGRESO ──
    {
        id: 'first-concept',
        title: 'Primer concepto',
        description: 'Completa todos los ejercicios de un concepto.',
        icon: '📚',
        category: 'progreso',
        check: (_, progress) => progress.some(p => p.completedExercises.length === 3),
    },
    {
        id: 'first-dominated',
        title: 'Dominado',
        description: 'Domina tu primer concepto con 80%+ de precisión.',
        icon: '⭐',
        category: 'progreso',
        check: (_, progress) => progress.some(p => p.dominated),
    },
    {
        id: 'dominated-5',
        title: 'Experto emergente',
        description: 'Domina 5 conceptos.',
        icon: '🧠',
        category: 'progreso',
        check: (_, progress) => progress.filter(p => p.dominated).length >= 5,
    },
    {
        id: 'dominated-10',
        title: 'Maestro del código',
        description: 'Domina 10 conceptos.',
        icon: '👑',
        category: 'progreso',
        check: (_, progress) => progress.filter(p => p.dominated).length >= 10,
    },
    {
        id: 'two-languages',
        title: 'Políglota',
        description: 'Practica en 2 lenguajes diferentes.',
        icon: '🌐',
        category: 'progreso',
        check: (sessions) => new Set(sessions.map(s => s.language)).size >= 2,
    },
    {
        id: 'speed-and-precision',
        title: 'El equilibrio',
        description: 'Consigue 60+ WPM con 95%+ de precisión en la misma sesión.',
        icon: '⚖️',
        category: 'progreso',
        check: (sessions) => sessions.some(s => s.wpm >= 60 && s.accuracy >= 95),
    },
];