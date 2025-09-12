
import type { Metadata } from 'next';
import SettingsContent from '@/components/settings/settings-content';

export const metadata: Metadata = {
  title: 'Vendor Settings',
  description: 'Manage your UniNest vendor account settings, update your profile, and manage services.',
};


export default function SettingsPage() {
    return <SettingsContent />
}
