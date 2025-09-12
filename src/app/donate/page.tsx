import type { Metadata } from 'next';
import DonateContent from '@/components/donate/donate-content';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Support UniNest – Fuel the Future of Students',
  description: 'Your donation helps UniNest stay alive for your campus. Join the Hall of Heroes and contribute to keep the platform running for students.',
};

type AggregatedDonor = {
    name: string | null;
    avatar: string | null;
    amount: number;
    email: string | null;
}

export default async function DonatePage() {
    const supabase = createClient();
    
    // Fetch initial data for SSR
    // Use the RPC function to get aggregated donor data efficiently
    const { data: aggregatedDonors, error: donorsError } = await supabase
        .rpc('get_aggregated_donors');

    const { data: goalData, error: goalError } = await supabase
        .from('app_config')
        .select('value')
        .eq('key', 'donation_goal')
        .single();
    
    const { data: raisedData, error: raisedError } = await supabase
        .from('donations')
        .select('amount');

    if (donorsError) console.error('Error fetching donors:', donorsError);
    if (raisedError) console.error('Error fetching raised amount:', raisedError);

    const goalAmount = goalData ? Number(goalData.value) : 50000;
    const initialRaisedAmount = (raisedData || []).reduce((sum, d) => sum + d.amount, 0);

    return <DonateContent 
        initialDonors={aggregatedDonors as AggregatedDonor[] || []}
        initialGoal={goalAmount}
        initialRaised={initialRaisedAmount}
    />
}
