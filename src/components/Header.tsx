'use client';

import { Code2, BookOpen, Trophy, Settings, LogIn, LogOut, User, Award } from 'lucide-react';
import { Button } from './ui/button';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';


export function Header() {
  const { user, loading, signInWithGoogle, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-2">
          <Link href="/" className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
              <Code2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-xl leading-tight truncate">CapiType</h1>
              <p className="hidden sm:block text-xs text-muted-foreground">Aprende a programar al ritmo de tus dedos</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/achievements" className="text-sm text-foreground hover:text-primary transition-colors flex items-center gap-2">
              <Award className="w-4 h-4" />
              Logros
            </Link>
            <Link href="/settings">
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
            </Link>

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
          <div className="md:hidden flex items-center gap-0.5 flex-shrink-0">
            <Link href="/achievements">
              <Button variant="ghost" size="sm" className="px-2">
                <Award className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/settings">
              <Button variant="ghost" size="sm" className="px-2">
                <Settings className="w-4 h-4" />
              </Button>
            </Link>
            {!loading && (
              user ? (
                <Button variant="ghost" size="sm" onClick={signOut} className="px-2">
                  <LogOut className="w-4 h-4" />
                </Button>
              ) : (
                <Button size="sm" onClick={signInWithGoogle} className="px-2.5">
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