import { Code2, BookOpen, Trophy, Settings, LogIn, LogOut, User } from 'lucide-react';
import { Button } from './ui/button';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export function Header() {
  const { user, loading, signInWithGoogle, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Code2 className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl leading-tight">CapiType</h1>
              <p className="text-xs text-muted-foreground">Aprende a programar al ritmo de tus dedos</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/stats" className="text-sm text-foreground hover:text-primary transition-colors flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Stats
            </Link>
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4" />
            </Button>

            {!loading && (
              user ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                    style={{ background: 'var(--muted)' }}>
                    <User className="w-3.5 h-3.5" style={{ color: 'var(--muted-foreground)' }} />
                    <span className="text-xs font-medium truncate max-w-[120px]">
                      {user.user_metadata?.name ?? user.email}
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={signOut}>
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <Button size="sm" onClick={signInWithGoogle} className="gap-2">
                  <LogIn className="w-4 h-4" />
                  Iniciar sesión
                </Button>
              )
            )}
          </nav>

          {/* Mobile */}
          <div className="md:hidden flex items-center gap-2">
            {!loading && (
              user ? (
                <Button variant="ghost" size="sm" onClick={signOut}>
                  <LogOut className="w-4 h-4" />
                </Button>
              ) : (
                <Button size="sm" onClick={signInWithGoogle}>
                  <LogIn className="w-4 h-4" />
                </Button>
              )
            )}
          </div>
        </div>
      </div>
    </header>
  );
}