
import type { Metadata } from 'next';
import ProfileClient from '@/components/profile/profile-client';

export const metadata: Metadata = {
  title: 'My Profile | UniNest',
  description: 'View and manage your profile, notes, listings, and activity.',
};

export default function ProfilePage() {
  return <ProfileClient />;
}
