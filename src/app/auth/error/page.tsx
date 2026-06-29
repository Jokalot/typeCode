export default function AuthErrorPage() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
                    Error de autenticación
                </h1>
                <p className="text-sm mb-4" style={{ color: 'var(--muted-foreground)' }}>
                    Algo salió mal. Por favor intenta de nuevo.
                </p>
                <a href="/" className="text-sm font-medium" style={{ color: 'var(--primary)' }}>
                    Volver al inicio
                </a>
            </div>
        </div>
    );
}