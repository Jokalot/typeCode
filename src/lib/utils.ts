import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Elimina comentarios (`#` en Python, `//` en JS/TS) de un snippet de código,
 * preservando el contenido de strings (comillas simples, dobles y backticks)
 * que puedan contener esos mismos caracteres (URLs, f-strings, etc).
 * También elimina las líneas vacías que quedan tras remover los comentarios.
 */
export function stripComments(code: string, language: string): string {
  const isPython = language.toLowerCase().startsWith('py');
  const quoteChars = isPython ? ["'", '"'] : ["'", '"', '`'];

  let result = '';
  let quote: string | null = null;
  let i = 0;

  while (i < code.length) {
    const ch = code[i];

    if (quote) {
      result += ch;
      if (ch === '\\' && i + 1 < code.length) {
        result += code[i + 1];
        i += 2;
        continue;
      }
      if (ch === quote) quote = null;
      i++;
      continue;
    }

    if (quoteChars.includes(ch)) {
      quote = ch;
      result += ch;
      i++;
      continue;
    }

    if (isPython && ch === '#') {
      while (i < code.length && code[i] !== '\n') i++;
      continue;
    }

    if (!isPython && ch === '/' && code[i + 1] === '/') {
      while (i < code.length && code[i] !== '\n') i++;
      continue;
    }

    result += ch;
    i++;
  }

  return result
    .split('\n')
    .map(line => line.replace(/[ \t]+$/, ''))
    .filter(line => line.trim() !== '')
    .join('\n');
}
