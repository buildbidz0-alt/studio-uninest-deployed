
import { Suspense } from 'react';
import type { Metadata } from 'next';
import ProfileClient from '@/components/profile/profile-client';
import { createClient } from '@/lib/supabase/server';

type Props = {
  params: { handle: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createClient();
  const handle = params.handle;

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, bio')
    .eq('handle', handle)
    .single();

  if (!profile) {
    return {
      title: 'Profile not found | UniNest',
    };
  }

  return {
    title: `${profile.full_name} (@${handle}) | UniNest`,
    description: profile.bio || `View the profile of ${profile.full_name} on UniNest.`,
  };
}


function PublicProfilePage() {
  return <ProfileClient />;
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading profile...</div>}>
      <PublicProfilePage />
    </Suspense>
  );
}
