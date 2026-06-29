import { HeaderWrapper } from '@/components/HeaderWrapper';
import { HomeClient } from '@/components/HomeClient';

export default function RootPage() {
  return (
    <div className="bg-background">
      <HeaderWrapper />
      <main>
        <HomeClient />
      </main>
      <footer className="border-t border-border mt-8 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2026 CapiType — Aprende a escribir a un ritmo mucho mayor.
        </div>
      </footer>
    </div>
  );
}