import type { Metadata } from 'next';
import DonateContent from '@/components/donate/donate-content';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Support UniNest – Fuel the Future of Students',
  description: 'Your donation helps UniNest stay alive for your campus. Join the Hall of Heroes and contribute to keep the platform running for students.',
};

export default async function DonatePage() {
    const supabase = createClient();
    
    // Fetch initial data for SSR
    const { data: donations } = await supabase.from('donations').select('amount, profiles(full_name, avatar_url, email)');
    const { data: goalData, error: goalError } = await supabase.from('app_config').select('value').eq('key', 'donation_goal').single();

    const goalAmount = goalData ? Number(goalData.value) : 50000;
    
    // Aggregate top donors on the server
    const aggregatedDonors = (donations || []).reduce((acc: any[], current) => {
        if (!current.profiles) { // Handle anonymous donations
             const anon = acc.find(d => d.email === null);
             if (anon) {
                 anon.amount += current.amount;
             } else {
                 acc.push({ name: 'Anonymous', email: null, avatar: null, amount: current.amount });
             }
             return acc;
        }
        const existing = acc.find(d => d.email === current.profiles!.email);
        if (existing) {
            existing.amount += current.amount;
        } else {
            acc.push({
                name: current.profiles.full_name,
                email: current.profiles.email,
                avatar: current.profiles.avatar_url,
                amount: current.amount
            });
        }
        return acc;
    }, []).sort((a: any, b: any) => b.amount - a.amount);
    
    const initialRaisedAmount = (donations || []).reduce((sum, d) => sum + d.amount, 0);

    return <DonateContent 
        initialDonors={aggregatedDonors}
        initialGoal={goalAmount}
        initialRaised={initialRaisedAmount}
    />
}