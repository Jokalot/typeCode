'use client';

import { useEffect, useState } from 'react';
import { AchievementIcon } from '@/components/icons/AchievementIcon';
import { Achievement } from '@/data/achievements';

interface Props {
    achievement: Achievement;
    onDismiss: () => void;
}

export function AchievementToast({ achievement, onDismiss }: Props) {
    const [visible, setVisible] = useState(false);
    const [leaving, setLeaving] = useState(false);

    useEffect(() => {
        // Entra
        const t1 = setTimeout(() => setVisible(true), 50);
        // Sale
        const t2 = setTimeout(() => {
            setLeaving(true);
            setTimeout(onDismiss, 400);
        }, 4000);
        return () => { clearTimeout(t1); clearTimeout(t2); };
    }, [onDismiss]);

    return (
        <div
            className="fixed bottom-6 right-6 z-[100] flex items-center gap-4 px-5 py-4 rounded-2xl shadow-2xl transition-all duration-400"
            style={{
                background: 'linear-gradient(135deg, #1a1714 0%, #2a2420 100%)',
                border: '1px solid rgba(168,144,128,0.3)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(168,144,128,0.1)',
                transform: visible && !leaving ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
                opacity: visible && !leaving ? 1 : 0,
                minWidth: '280px',
                maxWidth: '340px',
            }}
            onClick={() => { setLeaving(true); setTimeout(onDismiss, 400); }}
        >
            {/* Barra de progreso superior */}
            <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl overflow-hidden">
                <div
                    className="h-full rounded-full"
                    style={{
                        background: 'var(--primary)',
                        animation: 'shrink 4s linear forwards',
                    }}
                />
            </div>

            {/* Icono */}
            <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                    background: 'rgba(168,144,128,0.15)',
                    border: '1px solid rgba(168,144,128,0.3)',
                }}
            >
                <AchievementIcon id={achievement.id} size={26} color="var(--primary)" unlocked />
            </div>

            {/* Texto */}
            <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5"
                    style={{ color: 'var(--primary)' }}>
                    Logro desbloqueado
                </p>
                <p className="text-sm font-bold text-white truncate">{achievement.title}</p>
                <p className="text-xs mt-0.5 truncate" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    {achievement.description}
                </p>
            </div>

            <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
        </div>
    );
}