
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import InternshipDetailClient from '@/components/workspace/internship-detail-client';

type InternshipDetailPageProps = {
    params: { id: string };
};

export async function generateMetadata({ params }: InternshipDetailPageProps): Promise<Metadata> {
  const supabase = createClient();
  const { data: internship } = await supabase
    .from('internships')
    .select('role, company')
    .eq('id', params.id)
    .single();

  if (!internship) {
    return {
      title: 'Internship Not Found | UniNest',
    };
  }

  return {
    title: `${internship.role} at ${internship.company} | UniNest`,
    description: `Apply for the ${internship.role} internship at ${internship.company}.`,
  };
}


export default async function InternshipDetailPage({ params }: InternshipDetailPageProps) {
    const supabase = createClient();
    const { data: internship, error } = await supabase
        .from('internships')
        .select('*')
        .eq('id', params.id)
        .single();
    
    if (error || !internship) {
        notFound();
    }
    
    const { data: applicants } = await supabase
        .from('internship_applications')
        .select(`
            user_id,
            profiles (
                full_name,
                avatar_url
            )
        `)
        .eq('internship_id', internship.id);

    return <InternshipDetailClient internship={internship} initialApplicants={applicants || []} />;
}
