
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import CompetitionDetailClient from '@/components/workspace/competition-detail-client';

type CompetitionDetailPageProps = {
    params: { id: string };
};

export async function generateMetadata({ params }: CompetitionDetailPageProps): Promise<Metadata> {
  const supabase = createClient();
  const { data: competition } = await supabase
    .from('competitions')
    .select('title, description')
    .eq('id', params.id)
    .single();

  if (!competition) {
    return {
      title: 'Competition Not Found | UniNest',
    };
  }

  return {
    title: `${competition.title} | UniNest Competitions`,
    description: competition.description,
  };
}


export default async function CompetitionDetailPage({ params }: CompetitionDetailPageProps) {
    const supabase = createClient();
    
    let competitionQuery = supabase
        .from('competitions')
        .select('*, winner:winner_id(full_name, avatar_url)')
        .eq('id', params.id)
        .single();
        
    const { data: competition, error } = await competitionQuery;

    if (error || !competition) {
        notFound();
    }

    const { data: entries, error: entriesError } = await supabase
        .from('competition_entries')
        .select(`
            user_id,
            profiles (
                full_name,
                avatar_url
            )
        `)
        .eq('competition_id', competition.id);


    return <CompetitionDetailClient competition={competition as any} initialApplicants={entries || []} />;
}
