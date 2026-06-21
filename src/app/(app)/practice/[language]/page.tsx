import { LANGUAGES } from '@/data/languages';
import { notFound } from 'next/navigation';
import { PracticeClient } from '@/components/practice/PracticeClient';

interface Props {
    params: Promise<{ language: string }>;
}

export function generateStaticParams() {
    return LANGUAGES.map(l => ({ language: l.name.toLowerCase() }));
}

export default async function PracticePage({ params }: Props) {
    const { language } = await params;
    const lang = LANGUAGES.find(l => l.name.toLowerCase() === language);
    if (!lang) notFound();

    return <PracticeClient language={lang} />;
}