import SignupForm from '@/components/auth/signup-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Sign Up | Uninest',
    description: 'Create a new account on Uninest.',
};

export default function SignupPage() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const isSupabaseConfigured = supabaseUrl && supabaseAnonKey;

    if (!isSupabaseConfigured) {
        return (
            <div className="flex min-h-[calc(100vh-150px)] items-center justify-center bg-background">
                <div className="p-8 rounded-lg border bg-card text-card-foreground shadow-sm w-full max-w-sm">
                    <h1 className="text-2xl font-bold text-center">Sign Up Disabled</h1>
                    <p className="text-muted-foreground text-center mt-2">
                        The authentication service is not configured. Please add your Supabase credentials to the .env file.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-[calc(100vh-150px)] items-center justify-center bg-background">
            <SignupForm />
        </div>
    );
}
