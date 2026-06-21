import { Language } from '@/types';
import { PYTHON_CONCEPTS } from './snippets/python';
import { JAVASCRIPT_CONCEPTS } from './snippets/javascript';

const PYTHON_LEVELS = [
  {
    id: 'fundamentos' as const,
    label: 'Fundamentos',
    description: 'Sintaxis básica y estructuras de control',
    icon: 'fundamentos',
    concepts: PYTHON_CONCEPTS.filter(c =>
      ['variables', 'condicionales', 'ciclo-for', 'ciclo-while', 'funciones'].includes(c.id)
    ),
  },
  {
    id: 'algoritmia' as const,
    label: 'Algoritmia',
    description: 'Estructuras de datos y lógica',
    icon: 'algoritmia',
    concepts: PYTHON_CONCEPTS.filter(c =>
      ['listas', 'diccionarios', 'lambda-map-filter', 'recursion', 'ordenamiento'].includes(c.id)
    ),
  },
  {
    id: 'buenas-practicas' as const,
    label: 'Buenas Prácticas',
    description: 'Código limpio y patrones profesionales',
    icon: 'buenas-practicas',
    concepts: PYTHON_CONCEPTS.filter(c =>
      ['manejo-errores', 'clases', 'herencia', 'decoradores', 'context-manager'].includes(c.id)
    ),
  },
  {
    id: 'entrevista' as const,
    label: 'Modo Entrevista',
    description: 'Problemas tipo LeetCode y casos reales',
    icon: 'entrevista',
    concepts: PYTHON_CONCEPTS.filter(c =>
      ['two-sum', 'palindromo', 'aplanar-lista', 'anagramas', 'busqueda-binaria'].includes(c.id)
    ),
  },
];

const JAVASCRIPT_LEVELS = [
  {
    id: 'fundamentos' as const,
    label: 'Fundamentos',
    description: 'Sintaxis básica y estructuras de control',
    icon: 'fundamentos',
    concepts: JAVASCRIPT_CONCEPTS.filter(c =>
      ['variables', 'condicionales', 'ciclo-for', 'ciclo-while', 'funciones'].includes(c.id)
    ),
  },
  {
    id: 'algoritmia' as const,
    label: 'Algoritmia',
    description: 'Estructuras de datos y lógica',
    icon: 'algoritmia',
    concepts: JAVASCRIPT_CONCEPTS.filter(c =>
      ['listas', 'diccionarios', 'lambda-map-filter', 'recursion', 'ordenamiento'].includes(c.id)
    ),
  },
  {
    id: 'buenas-practicas' as const,
    label: 'Buenas Prácticas',
    description: 'Código limpio y patrones profesionales',
    icon: 'buenas-practicas',
    concepts: JAVASCRIPT_CONCEPTS.filter(c =>
      ['manejo-errores', 'clases', 'herencia', 'decoradores', 'context-manager'].includes(c.id)
    ),
  },
  {
    id: 'entrevista' as const,
    label: 'Modo Entrevista',
    description: 'Problemas tipo LeetCode y casos reales',
    icon: 'entrevista',
    concepts: JAVASCRIPT_CONCEPTS.filter(c =>
      ['two-sum', 'palindromo', 'aplanar-lista', 'anagramas', 'busqueda-binaria'].includes(c.id)
    ),
  },
];

export const LANGUAGES: Language[] = [
  {
    name: 'Python',
    icon: 'python',
    tag: 'DATA',
    description: 'Perfecto para ciencia de datos, IA y desarrollo backend.',
    difficulty: 'Principiante',
    accentColor: '#3776ab',
    levels: PYTHON_LEVELS,
  },
  {
    name: 'JavaScript',
    icon: 'javascript',
    tag: 'WEB',
    description: 'El lenguaje más popular para desarrollo web y aplicaciones modernas.',
    difficulty: 'Principiante',
    accentColor: '#c9a227',
    levels: JAVASCRIPT_LEVELS,
  },
];