import { Code2, BookOpen, Trophy, Settings } from 'lucide-react';
import { Button } from './ui/button';
import Link from 'next/link';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Code2 className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl leading-tight">CapiType</h1>
              <p className="text-xs text-muted-foreground">Aprende a escribir a un ritmo mucho mayor</p>
            </div>
          </div>

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

          <Button variant="ghost" size="sm" className="md:hidden">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
