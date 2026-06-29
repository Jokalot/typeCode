import { HeaderWrapper } from '@/components/HeaderWrapper';

export default function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-background">
            <HeaderWrapper />
            <main>{children}</main>
            <footer className="border-t border-border mt-8 py-6">
                <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
                    © 2026 CodeType — Aprende programando al ritmo de tus dedos.
                </div>
            </footer>
        </div>
    );
}