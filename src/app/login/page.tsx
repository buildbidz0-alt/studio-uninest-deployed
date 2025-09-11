
'use client';

import type { Metadata } from 'next';
import LoginForm from '@/components/auth/login-form';
import { useAuth } from '@/hooks/use-auth';

// This is a client component, so we can't export metadata directly.
// export const metadata: Metadata = {
//     title: 'Login | Uninest',
//     description: 'Login to your Uninest account.',
// };

export default function LoginPage() {
    const { supabase } = useAuth();
    
    if (!supabase) {
        return (
            <div className="flex min-h-[calc(100vh-150px)] items-center justify-center bg-background">
                <div className="p-8 rounded-lg border bg-card text-card-foreground shadow-sm w-full max-w-sm text-center">
                    <h1 className="text-2xl font-bold">Authentication Not Configured</h1>
                    <p className="text-muted-foreground mt-2">
                        Please add your Supabase credentials to the <code className="bg-muted px-1 py-0.5 rounded">.env</code> file to enable login and signup.
                    </p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="flex min-h-[calc(100vh-150px)] items-center justify-center bg-background">
            <LoginForm />
        </div>
    );
}
