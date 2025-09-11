
import { Suspense } from 'react';
import type { Metadata } from 'next';
import ProfileClient from '@/components/profile/profile-client';

export const metadata: Metadata = {
  title: 'My Profile | UniNest',
  description: 'View and manage your profile, notes, listings, and activity.',
};

// This component acts as a wrapper to enable suspense for search params
function ProfilePageContent() {
  return <ProfileClient />;
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div>Loading profile...</div>}>
      <ProfilePageContent />
    </Suspense>
  );
}
