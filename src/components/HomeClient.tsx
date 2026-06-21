'use client';

import { useRouter } from 'next/navigation';
import { LanguageSelectScreen } from './LanguageSelectScreen';
import { LANGUAGES } from '@/data/languages';

export function HomeClient() {
    const router = useRouter();

    return (
        <LanguageSelectScreen
            languages={LANGUAGES}
            onSelect={(i) => router.push(`/practice/${LANGUAGES[i].name.toLowerCase()}`)}
        />
    );
}