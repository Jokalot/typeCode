import { HeaderWrapper } from '@/components/HeaderWrapper';
import { SettingsClient } from '@/components/settings/SettingsClient';

export default function SettingsPage() {
    return (
        <div className="bg-background min-h-screen">
            <HeaderWrapper />
            <main>
                <SettingsClient />
            </main>
        </div>
    );
}
