'use client';

import { useState } from 'react';
import { Code2, BookOpen, Trophy, Settings, Menu, X } from 'lucide-react';
import { Button } from './ui/button';
import Link from 'next/link';

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
              <Code2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl leading-tight">CapiType</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">Aprende a escribir a un ritmo mucho mayor</p>
            </div>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            <a href="#" className="text-sm text-foreground hover:text-primary transition-colors flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Lecciones
            </a>
            <Link href="/stats" className="text-sm text-foreground hover:text-primary transition-colors flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Stats
            </Link>
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
            <Button size="sm">
              Empezar ahora
            </Button>
          </nav>

          {/* Mobile hamburger button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile nav overlay */}
      {menuOpen && (
        <div className="md:hidden border-t border-border bg-background/98 backdrop-blur animate-in slide-in-from-top-2 duration-200">
          <nav className="container mx-auto px-3 py-4 flex flex-col gap-1">
            <a
              href="#"
              className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-foreground hover:bg-muted transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              <BookOpen className="w-4 h-4 text-muted-foreground" />
              Lecciones
            </a>
            <Link
              href="/stats"
              className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-foreground hover:bg-muted transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              <Trophy className="w-4 h-4 text-muted-foreground" />
              Estadísticas
            </Link>
            <a
              href="#"
              className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-foreground hover:bg-muted transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              <Settings className="w-4 h-4 text-muted-foreground" />
              Configuración
            </a>
            <div className="pt-2 mt-1 border-t border-border">
              <Button size="sm" className="w-full" onClick={() => setMenuOpen(false)}>
                Empezar ahora
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
