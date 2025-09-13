
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
    const { data: competition, error } = await supabase
        .from('competitions')
        .select('*')
        .eq('id', params.id)
        .single();
    
    if (error || !competition) {
        notFound();
    }

    return <CompetitionDetailClient competition={competition} />;
}
